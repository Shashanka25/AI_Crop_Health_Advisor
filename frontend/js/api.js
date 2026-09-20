import { CONFIG } from './config.js';
import { buildPrompt } from './prompt.js';
import { SAMPLES, SAMPLE_IMAGES } from './data.js';

/* ══ 1. Image preparation ═══════════════════════════════════════
   Everything here runs on the phone. A 12 MP photo becomes roughly
   150 KB before it touches the network, and three cheap checks catch
   the photos that waste a call. */

export async function prepareImage(file) {
  const bitmap = await loadBitmap(file);
  const scale = Math.min(1, CONFIG.maxEdge / Math.max(bitmap.width, bitmap.height));
  const w = Math.round(bitmap.width * scale);
  const h = Math.round(bitmap.height * scale);

  const canvas = document.createElement('canvas');
  canvas.width = w; canvas.height = h;
  canvas.getContext('2d').drawImage(bitmap, 0, 0, w, h);

  const blob = await new Promise(r => canvas.toBlob(r, 'image/jpeg', CONFIG.jpegQuality));
  const dataUrl = canvas.toDataURL('image/jpeg', CONFIG.jpegQuality);
  const thumb = await makeThumb(bitmap);
  bitmap.close?.();

  return { blob, dataUrl, thumb, width: w, height: h, quality: inspect(canvas) };
}

function loadBitmap(file) {
  if (window.createImageBitmap) return createImageBitmap(file);
  return new Promise((res, rej) => {
    const img = new Image();
    img.onload = () => res(img);
    img.onerror = () => rej(new Error('decode'));
    img.src = URL.createObjectURL(file);
  });
}

async function makeThumb(bitmap) {
  const side = 180;
  const c = document.createElement('canvas');
  c.width = c.height = side;
  const s = Math.max(side / bitmap.width, side / bitmap.height);
  const dw = bitmap.width * s, dh = bitmap.height * s;
  c.getContext('2d').drawImage(bitmap, (side - dw) / 2, (side - dh) / 2, dw, dh);
  return c.toDataURL('image/jpeg', 0.7);
}

/* Brightness, sharpness and how much of the frame is leaf-coloured.
   Crude on purpose: it only has to reject the obvious failures. */
function inspect(canvas) {
  const side = 200;
  const c = document.createElement('canvas');
  c.width = c.height = side;
  c.getContext('2d').drawImage(canvas, 0, 0, side, side);
  const px = c.getContext('2d').getImageData(0, 0, side, side).data;

  const grey = new Float32Array(side * side);
  let sum = 0, plantish = 0;
  for (let i = 0, p = 0; i < px.length; i += 4, p++) {
    const r = px[i], g = px[i + 1], b = px[i + 2];
    const y = 0.299 * r + 0.587 * g + 0.114 * b;
    grey[p] = y; sum += y;
    if (g > r + 6 && g > b + 6) plantish++;
    else if (r > 90 && g > 70 && b < 90 && Math.abs(r - g) < 70) plantish += 0.5; // dry or yellowed tissue
  }

  // Variance of a Laplacian — the standard cheap sharpness measure.
  let m = 0, m2 = 0, n = 0;
  for (let y = 1; y < side - 1; y++) {
    for (let x = 1; x < side - 1; x++) {
      const i = y * side + x;
      const l = 4 * grey[i] - grey[i - 1] - grey[i + 1] - grey[i - side] - grey[i + side];
      m += l; m2 += l * l; n++;
    }
  }
  const sharpness = m2 / n - (m / n) ** 2;
  const brightness = sum / (side * side);
  const plantRatio = plantish / (side * side);

  let flag = null;
  if (brightness < 42) flag = 'dark';
  else if (sharpness < 55) flag = 'blurry';
  else if (plantRatio < 0.12) flag = 'notplant';

  return { brightness, sharpness, plantRatio, flag };
}

/* ══ 2. Which route are we on? ══════════════════════════════════ */

let routeCache;
export async function resolveRoute() {
  if (routeCache) return routeCache;
  routeCache = await (async () => {
    if (window.claude?.use) {
      const sample = await window.claude.use('sample').catch(() => null);
      if (sample) {
        const limits = await sample.limits?.().catch(() => null);
        if (limits?.images) return { name: 'claude', sample };
      }
    }
    if (CONFIG.apiBase !== '' || location.protocol.startsWith('http')) {
      return { name: 'backend' };
    }
    if (CONFIG.anthropicKey) return { name: 'direct' };
    return { name: 'samples' };
  })();
  return routeCache;
}

/* ══ 3. Diagnose ════════════════════════════════════════════════ */

export async function diagnose({ blob, language, crop, note, signal }) {
  const route = await resolveRoute();
  const prompt = buildPrompt({ language, crop, note });

  if (route.name === 'claude') {
    const data = await route.sample.json(prompt, {
      images: [blob], modelTier: 'default', signal, cache: false
    });
    return { data, via: 'claude' };
  }

  if (route.name === 'backend') {
    const fd = new FormData();
    fd.append('photo', blob, 'leaf.jpg');
    fd.append('language', language);
    fd.append('crop', crop || 'not stated');
    fd.append('note', note || '');
    const res = await fetch(CONFIG.apiBase.replace(/\/$/, '') + '/api/diagnose', {
      method: 'POST', body: fd, signal
    });
    if (res.status === 429) throw tagged('busy');
    if (!res.ok) throw tagged('net');
    return { data: await res.json(), via: 'backend' };
  }

  if (route.name === 'direct') {
    const b64 = await blobToBase64(blob);
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST', signal,
      headers: {
        'content-type': 'application/json',
        'x-api-key': CONFIG.anthropicKey,
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true'
      },
      body: JSON.stringify({
        model: CONFIG.model, max_tokens: 2000,
        messages: [{ role: 'user', content: [
          { type: 'image', source: { type: 'base64', media_type: 'image/jpeg', data: b64 } },
          { type: 'text', text: prompt }
        ] }]
      })
    });
    if (res.status === 429) throw tagged('busy');
    if (!res.ok) throw tagged('net');
    const body = await res.json();
    const text = body.content.filter(b => b.type === 'text').map(b => b.text).join('');
    return { data: parseLoose(text), via: 'direct' };
  }

  throw tagged('nobackend');
}

function tagged(code) { const e = new Error(code); e.code = code; return e; }

function blobToBase64(blob) {
  return new Promise((res, rej) => {
    const r = new FileReader();
    r.onload = () => res(String(r.result).split(',')[1]);
    r.onerror = () => rej(new Error('read'));
    r.readAsDataURL(blob);
  });
}

/* Models sometimes wrap JSON in a fence or a sentence. Read it kindly. */
export function parseLoose(text) {
  try { return JSON.parse(text); } catch { /* keep going */ }
  const fence = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fence) { try { return JSON.parse(fence[1]); } catch { /* keep going */ } }
  const a = text.indexOf('{'), b = text.lastIndexOf('}');
  if (a !== -1 && b > a) return JSON.parse(text.slice(a, b + 1));
  throw tagged('parse');
}

/* ══ 4. Shape guard ═════════════════════════════════════════════
   Never let a malformed reply reach the screen half-rendered. A
   second dose-stripping pass runs here too: the backend does it
   properly, but the direct route has no backend to do it. */

const DOSE = /\b\d+(?:[.,]\d+)?\s*(?:ml|l|litres?|liters?|g|gm|grams?|kg|tsp|tbsp|teaspoons?|tablespoons?)\b/i;

export function normalise(raw, fallbackCrop) {
  const d = raw && typeof raw === 'object' ? raw : {};
  const num = (v, dflt) => (typeof v === 'number' && isFinite(v) ? v : dflt);
  const oneOf = (v, allowed, dflt) => (allowed.includes(v) ? v : dflt);
  const str = v => (typeof v === 'string' ? v.trim() : '');
  const list = v => (Array.isArray(v) ? v.map(str).filter(Boolean).slice(0, 6) : []);

  const steps = (Array.isArray(d.steps) ? d.steps : []).slice(0, 6).map(s => ({
    kind: oneOf(s?.kind, ['field', 'organic', 'chemical'], 'field'),
    title: str(s?.title),
    detail: stripDose(str(s?.detail)),
    when: str(s?.when)
  })).filter(s => s.title);

  // Chemicals last, whatever order the model used.
  const rank = { field: 0, organic: 1, chemical: 2 };
  steps.sort((a, b) => rank[a.kind] - rank[b.kind]);

  return {
    ok: d.ok !== false,
    is_plant: d.is_plant !== false,
    image_quality: oneOf(d.image_quality, ['good', 'poor'], 'good'),
    retake_tip: str(d.retake_tip),
    crop: str(d.crop) || fallbackCrop || '',
    problem: str(d.problem) || '—',
    problem_local: str(d.problem_local),
    confidence: Math.max(0, Math.min(1, num(d.confidence, 0.5))),
    severity: oneOf(d.severity, ['low', 'moderate', 'high'], 'moderate'),
    spread_risk: oneOf(d.spread_risk, ['low', 'medium', 'high'], 'low'),
    what_i_see: str(d.what_i_see),
    why_it_happens: str(d.why_it_happens),
    steps,
    prevention: list(d.prevention),
    see_expert_if: list(d.see_expert_if),
    neighbour_alert: str(d.neighbour_alert)
  };
}

/* A sentence with a dose in it exists to give a dose, so the whole
   sentence goes. Deleting only the number leaves "Use , per pump",
   which reads like a typo and invites a guess. */
function stripDose(s) {
  return s
    .replace(/[®™]/g, '')
    .split(/(?<=[.!?।])\s+/)
    .filter(part => part.trim() && !DOSE.test(part))
    .join(' ')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

/* ══ 5. Samples ═════════════════════════════════════════════════ */

export function sampleCase(id, lang) {
  return { data: structuredClone(SAMPLES[id][lang] || SAMPLES[id].en), image: SAMPLE_IMAGES[id] };
}
