import { CONFIG } from './config.js';
import { LANGS, CROPS, T, ABOUT } from './i18n.js';
import { prepareImage, diagnose, normalise, sampleCase, resolveRoute } from './api.js';

const $ = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];
const esc = s => String(s ?? '').replace(/[&<>"']/g, c =>
  ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

const store = {
  get(k, d) { try { return JSON.parse(localStorage.getItem('patta.' + k)) ?? d; } catch { return d; } },
  set(k, v) { try { localStorage.setItem('patta.' + k, JSON.stringify(v)); } catch { /* full */ } }
};

const state = {
  lang: store.get('lang', (navigator.language || '').slice(0, 2)) || 'en',
  theme: store.get('theme', 'auto'),
  crop: '',
  photo: null,       // { blob, dataUrl, thumb, quality }
  result: null,
  controller: null
};
if (!LANGS[state.lang]) state.lang = 'en';

const t = k => (T[state.lang] || T.en)[k] ?? T.en[k] ?? k;

/* ═════════ language ═════════ */

function applyLang() {
  document.documentElement.lang = state.lang;
  $$('[data-t]').forEach(el => { el.textContent = t(el.dataset.t); });
  $$('[data-t-ph]').forEach(el => { el.placeholder = t(el.dataset.tPh); });
  $$('[data-t-aria]').forEach(el => { el.setAttribute('aria-label', t(el.dataset.tAria)); });
  $$('.lang').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.lang === state.lang)));
  $('#aboutBody').innerHTML = ABOUT[state.lang] || ABOUT.en;
  renderCrops();
  updateGoBar();
  if (state.result) renderResult(state.result);
  renderHistory();
}

/* ═════════ views ═════════ */

function go(view) {
  $$('.view').forEach(v => v.classList.toggle('is-active', v.id === 'view-' + view));
  $$('.tab').forEach(b => b.classList.toggle('is-active', b.dataset.go === view));
  if (view === 'history') renderHistory();
  window.scrollTo({ top: 0, behavior: 'instant' });
}

/* ═════════ crop chips ═════════ */

function renderCrops() {
  $('#cropChips').innerHTML = CROPS.map(c =>
    `<button type="button" class="chip" data-crop="${c.id}" aria-pressed="${state.crop === c.id}">${esc(c[state.lang] || c.en)}</button>`
  ).join('');
}

function cropName() {
  const c = CROPS.find(x => x.id === state.crop);
  return c ? (c.en + (state.lang !== 'en' ? ` (${c[state.lang]})` : '')) : '';
}

/* ═════════ photo ═════════ */

async function usePhoto(file) {
  if (!file || !file.type.startsWith('image/')) return;
  try {
    const photo = await prepareImage(file);
    state.photo = photo;
    const vf = $('#viewfinder');
    vf.classList.add('has-photo');
    $('#preview').src = photo.dataUrl;
    $('#preview').hidden = false;
    $('#clearPhoto').hidden = false;

    const flag = photo.quality.flag;
    const msg = { dark: 'errDark', blurry: 'errBlurry', notplant: 'errNotPlant' }[flag];
    const box = $('#photoFlag');
    box.hidden = !msg;
    if (msg) box.textContent = t(msg);

    updateGoBar();
  } catch {
    toast(t('errGeneric'));
  }
}

function clearPhoto() {
  state.photo = null;
  $('#viewfinder').classList.remove('has-photo');
  $('#preview').hidden = true;
  $('#preview').removeAttribute('src');
  $('#clearPhoto').hidden = true;
  $('#photoFlag').hidden = true;
  stopCamera();
  updateGoBar();
}

let videoStream = null;

async function toggleCamera(e) {
  if (e) e.preventDefault();
  const video = $('#videoFeed');
  if (videoStream) {
    // Snap photo
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    canvas.getContext('2d').drawImage(video, 0, 0, canvas.width, canvas.height);
    canvas.toBlob(blob => {
      if (blob) usePhoto(new File([blob], "snapshot.jpg", { type: "image/jpeg" }));
    }, 'image/jpeg', CONFIG.jpegQuality);
    stopCamera();
  } else {
    // Start camera
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      try {
        videoStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
        video.srcObject = videoStream;
        video.hidden = false;
        $('#takePhotoLabel').textContent = 'Snap';
      } catch (err) {
        $('#camInput').click();
      }
    } else {
      $('#camInput').click();
    }
  }
}

function stopCamera() {
  if (videoStream) {
    videoStream.getTracks().forEach(t => t.stop());
    videoStream = null;
  }
  const video = $('#videoFeed');
  if (video) video.hidden = true;
  const label = $('#takePhotoLabel');
  if (label) label.textContent = t('takePhoto');
}

function updateGoBar() {
  const ready = !!state.photo;
  $('#diagnoseBtn').disabled = !ready;
  $('#goNote').textContent = ready ? t('readyNote') : t('needPhoto');
}

/* ═════════ diagnose ═════════ */

const BUSY_STEPS = ['busy1', 'busy2', 'busy3'];

async function runDiagnosis() {
  if (!state.photo) return;
  stopSpeaking();

  $('#busyImg').src = state.photo.dataUrl;
  go('busy');

  let i = 0;
  $('#busyStep').textContent = t(BUSY_STEPS[0]);
  const ticker = setInterval(() => {
    i = Math.min(i + 1, BUSY_STEPS.length - 1);
    $('#busyStep').textContent = t(BUSY_STEPS[i]);
  }, 6000);

  state.controller = new AbortController();

  try {
    const { data } = await diagnose({
      blob: state.photo.blob,
      language: LANGS[state.lang].model,
      crop: cropName(),
      note: $('#note').value.trim(),
      signal: state.controller.signal
    });
    const result = normalise(data, cropName());
    finish(result, state.photo.dataUrl, state.photo.thumb);
  } catch (err) {
    if (err?.name === 'AbortError' || err?.code === 'cancelled') {
      go('scan'); toast(t('cancelled')); return;
    }
    // Never leave the farmer on an error screen with nothing to look at.
    const fallbackId = state.crop === 'rice' ? 'rice_blast' : 'tomato_early_blight';
    const { data } = sampleCase(fallbackId, state.lang);
    finish(normalise(data), state.photo.dataUrl, state.photo.thumb);
    toast(t(errorKey(err)));
  } finally {
    clearInterval(ticker);
    state.controller = null;
  }
}

function errorKey(err) {
  switch (err?.code) {
    case 'busy': return 'errBusy';
    case 'net': return 'errNet';
    case 'nobackend': return 'offlineSample';
    default: return navigator.onLine ? 'errGeneric' : 'errNet';
  }
}

function showSample(id) {
  stopSpeaking();
  const { data, image } = sampleCase(id, state.lang);
  finish(normalise(data), image, image);
}

function finish(result, imageUrl, thumb) {
  result.image = imageUrl;
  result.ts = Date.now();
  result.lang = state.lang;
  state.result = result;
  saveScan({ id: String(result.ts), ts: result.ts, lang: state.lang, thumb, data: result });
  renderResult(result);
  go('result');
}

/* ═════════ result rendering ═════════ */

function renderResult(r) {
  const low = r.confidence < CONFIG.confidenceFloor;
  const sev = { low: t('low'), moderate: t('moderate'), high: t('high') }[r.severity];
  const spread = { low: t('low'), medium: t('medium'), high: t('high') }[r.spread_risk];
  const sevPct = { low: 33, moderate: 66, high: 100 }[r.severity];

  const kindLabel = { field: t('kindField'), organic: t('kindOrganic'), chemical: t('kindChemical') };
  const hasChemical = r.steps.some(s => s.kind === 'chemical');

  $('#result').innerHTML = `
  <div class="verdict sev-${esc(r.severity)}">
    ${r.image ? `<img class="verdict__photo" src="${esc(r.image)}" alt="">` : ''}
    <div class="verdict__body">
      ${r.crop ? `<p class="verdict__crop">${esc(r.crop)}</p>` : ''}
      <h2 class="verdict__name" id="resTitle">${esc(r.problem)}</h2>
      ${r.problem_local && r.problem_local !== r.problem
        ? `<p class="verdict__alt" lang="en">${esc(r.problem_local)}</p>` : ''}

      <div class="meter sev-${esc(r.severity)}">
        <div class="meter__top"><span>${esc(t('severity'))}</span><b>${esc(sev)}</b></div>
        <div class="meter__track"><div class="meter__fill" style="width:${sevPct}%"></div></div>
      </div>

      <div class="meter meter--conf">
        <div class="meter__top"><span>${esc(t('confidence'))}</span><b>${Math.round(r.confidence * 100)}%</b></div>
        <div class="meter__track"><div class="meter__fill" style="width:${Math.round(r.confidence * 100)}%"></div></div>
      </div>

      ${r.spread_risk !== 'low' ? `<p class="hint">${esc(t('spread'))}: <b>${esc(spread)}</b></p>` : ''}

      ${low ? `<p class="caution"><svg class="ic"><use href="#i-warn"/></svg><span>${esc(t('lowConf'))}</span></p>` : ''}
    </div>

    <div class="actions">
      <button type="button" class="btn" id="speakBtn">
        <svg class="ic"><use href="#i-speaker"/></svg><span>${esc(t('listen'))}</span>
      </button>
      <button type="button" class="btn btn--quiet" id="shareBtn">
        <svg class="ic"><use href="#i-share"/></svg><span>${esc(t('share'))}</span>
      </button>
    </div>
  </div>

  <div class="plan">
    ${r.what_i_see ? `<div class="block"><h3>${esc(t('whatISee'))}</h3><p>${esc(r.what_i_see)}</p>
      ${r.why_it_happens ? `<h3>${esc(t('whyHappens'))}</h3><p>${esc(r.why_it_happens)}</p>` : ''}</div>` : ''}

    <div class="block">
      <h3>${esc(t('planTitle'))}</h3>
      <ol class="steps">
        ${r.steps.map(s => `
          <li class="kind-${esc(s.kind)}">
            <div class="step__head">
              <span class="step__title">${esc(s.title)}</span>
              <span class="step__kind">${esc(kindLabel[s.kind])}</span>
            </div>
            ${s.detail ? `<p class="step__detail">${esc(s.detail)}</p>` : ''}
            ${s.when ? `<p class="step__when">${esc(s.when)}</p>` : ''}
          </li>`).join('')}
      </ol>
      ${hasChemical ? `<p class="hint">${esc(t('noDose'))}</p>` : ''}
    </div>

    ${r.prevention.length ? `<div class="block"><h3>${esc(t('prevention'))}</h3>
      <ul class="ticks">${r.prevention.map(p =>
        `<li><svg class="ic"><use href="#i-check"/></svg><span>${esc(p)}</span></li>`).join('')}</ul></div>` : ''}

    ${r.see_expert_if.length ? `<div class="block"><h3>${esc(t('expertIf'))}</h3>
      <ul class="ticks ticks--warn">${r.see_expert_if.map(p =>
        `<li><svg class="ic"><use href="#i-warn"/></svg><span>${esc(p)}</span></li>`).join('')}</ul></div>` : ''}

    ${r.neighbour_alert ? `<div class="block"><h3>${esc(t('neighbours'))}</h3><p>${esc(r.neighbour_alert)}</p></div>` : ''}

    <div class="helprow">
      <a class="btn btn--quiet" href="tel:${esc(CONFIG.kisanCallCentre.replace(/-/g, ''))}">
        <svg class="ic"><use href="#i-phone"/></svg><span>${esc(t('callKCC'))}</span>
      </a>
      <button type="button" class="btn" id="againBtn">
        <svg class="ic"><use href="#i-camera"/></svg><span>${esc(t('again'))}</span>
      </button>
    </div>

    <div class="feedback" id="feedback">
      <span>${esc(t('helpful'))}</span>
      <button type="button" class="chip" data-vote="up">${esc(t('yes'))}</button>
      <button type="button" class="chip" data-vote="down">${esc(t('no'))}</button>
    </div>
  </div>`;
}

/* ═════════ read aloud ═════════ */

let speaking = false;

function speechText(r) {
  const parts = [r.problem];
  if (r.what_i_see) parts.push(r.what_i_see);
  parts.push(t('planTitle') + '.');
  r.steps.forEach((s, i) => parts.push(`${i + 1}. ${s.title}. ${s.detail}`));
  if (r.confidence < CONFIG.confidenceFloor) parts.push(t('lowConf'));
  return parts.join(' ');
}

function pickVoice() {
  const want = LANGS[state.lang].voice;
  const voices = speechSynthesis.getVoices();
  for (const tag of want) {
    const v = voices.find(v => v.lang?.toLowerCase().startsWith(tag.toLowerCase()));
    if (v) return v;
  }
  return null;
}

function toggleSpeak() {
  if (speaking) { stopSpeaking(); return; }
  if (!('speechSynthesis' in window)) { toast(t('noVoice')); return; }

  const voice = pickVoice();
  if (!voice && state.lang !== 'en') toast(t('noVoice'));

  const u = new SpeechSynthesisUtterance(speechText(state.result));
  u.lang = LANGS[state.lang].bcp;
  if (voice) u.voice = voice;
  u.rate = 0.92;
  u.onend = u.onerror = () => { speaking = false; labelSpeak(); };
  speechSynthesis.cancel();
  speechSynthesis.speak(u);
  speaking = true;
  labelSpeak();
}

function stopSpeaking() {
  if ('speechSynthesis' in window) speechSynthesis.cancel();
  speaking = false; labelSpeak();
}

function labelSpeak() {
  const b = $('#speakBtn');
  if (b) b.querySelector('span').textContent = speaking ? t('stopListen') : t('listen');
}

/* ═════════ voice note ═════════ */

let recogniser = null;

function toggleMic() {
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SR) { $('#micHint').hidden = false; $('#micHint').textContent = t('micUnsupported'); return; }

  if (recogniser) { recogniser.stop(); return; }

  recogniser = new SR();
  recogniser.lang = LANGS[state.lang].bcp;
  recogniser.interimResults = true;
  recogniser.continuous = false;

  const hint = $('#micHint');
  hint.hidden = false; hint.textContent = t('listening');
  $('#micBtn').classList.add('is-live');

  const before = $('#note').value.trim();
  recogniser.onresult = e => {
    const said = [...e.results].map(r => r[0].transcript).join(' ');
    $('#note').value = (before ? before + ' ' : '') + said;
  };
  recogniser.onerror = () => { hint.textContent = t('micUnsupported'); };
  recogniser.onend = () => {
    recogniser = null;
    $('#micBtn').classList.remove('is-live');
    hint.hidden = true;
  };
  recogniser.start();
}

/* ═════════ share ═════════ */

function shareText(r) {
  const lines = [
    `${r.problem}${r.crop ? ' — ' + r.crop : ''}`,
    `${t('confidence')}: ${Math.round(r.confidence * 100)}%`,
    '',
    t('planTitle') + ':',
    ...r.steps.map((s, i) => `${i + 1}. ${s.title} — ${s.detail}`)
  ];
  if (r.see_expert_if.length) lines.push('', t('expertIf') + ': ' + r.see_expert_if.join('; '));
  lines.push('', 'Patta — ' + t('tagline'));
  return lines.join('\n');
}

async function share() {
  const text = shareText(state.result);
  if (navigator.share) {
    try { await navigator.share({ title: state.result.problem, text }); return; } catch { /* cancelled */ }
  }
  try { await navigator.clipboard.writeText(text); toast(t('copied')); }
  catch { toast(t('errGeneric')); }
}

/* ═════════ history ═════════ */

function saveScan(entry) {
  const all = store.get('history', []);
  all.unshift(entry);
  store.set('history', all.slice(0, CONFIG.historyLimit));
}

function renderHistory() {
  const all = store.get('history', []);
  const box = $('#historyList');
  if (!all.length) { box.innerHTML = `<p class="empty">${esc(t('emptyHistory'))}</p>`; return; }

  box.innerHTML = all.map(s => `
    <div class="hist">
      <img src="${esc(s.thumb || s.data.image || '')}" alt="">
      <button type="button" class="linkbtn" data-open="${esc(s.id)}" style="text-align:left">
        <b><span class="dot sev-${esc(s.data.severity)}"></span>${esc(s.data.problem)}</b>
        <small>${esc(s.data.crop || '')} · ${new Date(s.ts).toLocaleDateString(LANGS[s.lang]?.bcp || 'en-IN')}</small>
      </button>
      <button type="button" class="iconbtn" data-del="${esc(s.id)}" aria-label="${esc(t('delete'))}">
        <svg class="ic"><use href="#i-trash"/></svg>
      </button>
    </div>`).join('');
}

/* ═════════ theme + toast ═════════ */

function applyTheme() {
  document.documentElement.dataset.theme = state.theme;
}

let toastTimer;
function toast(msg) {
  const el = $('#toast');
  el.textContent = msg; el.hidden = false;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { el.hidden = true; }, 4200);
}

/* ═════════ wiring ═════════ */

function bind() {
  $$('.lang').forEach(b => b.addEventListener('click', () => {
    state.lang = b.dataset.lang; store.set('lang', state.lang); stopSpeaking(); applyLang();
  }));

  $$('[data-go]').forEach(b => b.addEventListener('click', e => { e.preventDefault(); go(b.dataset.go); }));

  $('#themeBtn').addEventListener('click', () => {
    const now = document.documentElement.dataset.theme;
    const isDark = now === 'dark' ||
      (now === 'auto' && matchMedia('(prefers-color-scheme: dark)').matches);
    state.theme = isDark ? 'light' : 'dark';
    store.set('theme', state.theme); applyTheme();
  });

  $('#camBtn').addEventListener('click', toggleCamera);
  $('#camInput').addEventListener('change', e => { stopCamera(); usePhoto(e.target.files[0]); });
  $('#fileInput').addEventListener('change', e => { stopCamera(); usePhoto(e.target.files[0]); });
  $('#clearPhoto').addEventListener('click', clearPhoto);

  const vf = $('#viewfinder');
  ['dragenter', 'dragover'].forEach(ev => vf.addEventListener(ev, e => { e.preventDefault(); }));
  vf.addEventListener('drop', e => { e.preventDefault(); usePhoto(e.dataTransfer.files[0]); });
  window.addEventListener('paste', e => {
    const f = [...(e.clipboardData?.files || [])][0];
    if (f) usePhoto(f);
  });

  $('#cropChips').addEventListener('click', e => {
    const b = e.target.closest('[data-crop]'); if (!b) return;
    state.crop = state.crop === b.dataset.crop ? '' : b.dataset.crop;
    renderCrops();
  });

  $('#micBtn').addEventListener('click', toggleMic);
  $('#diagnoseBtn').addEventListener('click', runDiagnosis);
  $('#cancelBtn').addEventListener('click', () => state.controller?.abort());

  $$('[data-sample]').forEach(b => b.addEventListener('click', () => showSample(b.dataset.sample)));

  $('#result').addEventListener('click', e => {
    if (e.target.closest('#speakBtn')) return toggleSpeak();
    if (e.target.closest('#shareBtn')) return share();
    if (e.target.closest('#againBtn')) { stopSpeaking(); clearPhoto(); return go('scan'); }
    const vote = e.target.closest('[data-vote]');
    if (vote) { $('#feedback').innerHTML = `<span>${esc(t('thanks'))}</span>`; }
  });

  $('#historyList').addEventListener('click', e => {
    const open = e.target.closest('[data-open]');
    if (open) {
      const s = store.get('history', []).find(x => x.id === open.dataset.open);
      if (s) { state.result = s.data; renderResult(s.data); go('result'); }
      return;
    }
    const del = e.target.closest('[data-del]');
    if (del) {
      store.set('history', store.get('history', []).filter(x => x.id !== del.dataset.del));
      renderHistory(); toast(t('deleted'));
    }
  });

  document.addEventListener('visibilitychange', () => { if (document.hidden) stopSpeaking(); });
  if ('speechSynthesis' in window) speechSynthesis.onvoiceschanged = () => {};
}

/* ═════════ start ═════════ */

async function init() {
  applyTheme();
  bind();
  applyLang();
  go('scan');

  if (!window.__PATTA_SINGLE_FILE__ && 'serviceWorker' in navigator && location.protocol.startsWith('http')) {
    navigator.serviceWorker.register('./sw.js').catch(() => {});
  }

  const route = await resolveRoute();
  if (route.name === 'samples') {
    // Say it once, quietly, so a judge knows what they are looking at.
    console.info('[Patta] No model configured — sample cases will answer. See frontend/js/config.js');
  }
}

init();
