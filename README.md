# Patta — AI crop-health advisor

**Theme:** Tech for a Better Tomorrow.
**In one line:** photograph a sick leaf, get a treatment plan in Telugu, Hindi or English, read aloud.

Smallholder farmers notice a crop disease late and reach an expert later still. One agriculture officer covers many villages, so a leaf spot can cross a field before anyone trained has looked at it — and a spray often gets bought before the problem is confirmed, which wastes money and can damage the crop.

Patta gives a first useful answer in under a minute, on the phone the farmer already owns.

**Try it now:** <https://claude.ai/artifact/Qu5C8bsChUkChEpN4kjozR> — the same `dist/patta.html` in this repo, running live. Photograph or upload a leaf and it really does diagnose it; open it on a phone to see the layout it was designed for.

---

## What it does

| | |
|---|---|
| **Photograph** | Camera or gallery. The photo is shrunk and checked on the phone before anything is sent. |
| **Diagnose** | A vision model reads the leaf and returns structured JSON: the problem, severity, spread risk, and an honest confidence score. |
| **Plan** | An ordered list of steps — field care first, natural options next, chemicals last. Active ingredient only, never a brand, never a dose. |
| **Speak** | The whole plan read aloud, and voice notes for farmers who would rather talk than type. |
| **Keep** | Scans saved on the device. No account, nothing uploaded. |
| **Work offline** | Installable PWA. The shell, the history and two sample cases work with no network. |

It is different from a plant-ID app in one way that matters: **it tells you when it does not know.** Below 60% confidence the first step is not a product, it is an agriculture officer.

---

## Run it

### Option A — just look at it (30 seconds)

Open `dist/patta.html` in any browser. One file, no server, no key. The two built-in sample cases answer, so the whole flow — language switch, viewfinder, severity and confidence meters, read-aloud, history — works immediately.

### Option B — real diagnosis, the right way (recommended)

```bash
pip install -r backend/requirements.txt
export ANTHROPIC_API_KEY=sk-ant-...        # Windows: set ANTHROPIC_API_KEY=...
uvicorn backend.main:app --reload --port 8000
```

Open <http://127.0.0.1:8000>. The backend serves the frontend, so there is no CORS to fight, and the key never leaves the server. Then set `apiBase` in `frontend/js/config.js` to `''` (same origin — already the default).

### Option C — frontend only, for a classroom demo

Serve `frontend/` with VS Code Live Server, put your key in `frontend/js/config.js`, and the page calls the model directly.

> Anyone who opens DevTools can read that key. Fine for a laptop on a desk, never for anything you put online. Option B exists for this reason.

Whichever route you pick, the app falls back to the sample cases if the network or the model fails. A demo should not die on stage.

---

## How it is put together:

```
Phone (PWA)
  │  photo shrunk to 1024px, brightness / sharpness / greenness checked here
  ▼
POST /api/diagnose   (FastAPI)
  ├─ re-encode the image, never trust the client
  ├─ vision model → structured JSON
  ├─ safety filter → strip doses, drop banned actives, force the shape
  └─ optional anonymous log  (off by default → outbreak map on the roadmap)
  ▼
Phone renders the plan, speaks it, saves it to localStorage
```

```
ai-crop-health-advisor/
├── dist/patta.html            one-file build — open it and it runs
├── frontend/
│   ├── index.html             app shell, icon sprite
│   ├── css/app.css            design tokens and layout
│   ├── js/config.js           ← the only file you normally edit
│   ├── js/prompt.js           the diagnosis prompt and its rules
│   ├── js/api.js              image prep, quality checks, the four routes
│   ├── js/app.js              state, views, voice, history
│   ├── js/i18n.js             English / Telugu / Hindi strings
│   ├── js/data.js             two offline sample cases
│   ├── sw.js                  service worker (offline shell)
│   └── manifest.webmanifest   installable PWA
├── backend/
│   ├── main.py                one endpoint, rate limited
│   ├── safety.py              the last gate before advice reaches a farmer
│   └── prompt.txt             same rules as prompt.js — keep them in sync
├── build/build_single.py      rebuilds dist/patta.html
└── docs/                      architecture, safety, demo script
```

Vanilla HTML, CSS and JavaScript. No framework, no build step, no `node_modules`. On a 2G connection in a field, every kilobyte is a choice — and a project a judge can read in one sitting is worth more than one that needs a toolchain to open.

---

## Design decisions worth defending

**Type comes from the phone.** Android already ships Noto Sans Telugu and Devanagari. Downloading a webfont over 2G to say the same thing would be a worse app, so the stylesheet asks for the system family and gives Indic scripts more line-height instead.

**Colour means something.** Marigold is the only action colour — if it is marigold, you tap it. Green, amber and red appear only on the severity meter. Nothing is coloured for decoration.

**The viewfinder is the front page.** No hero, no marketing. The app opens on the thing the farmer came to do.

**Steps are numbered because they really are a sequence.** Remove the leaves *before* you spray. Nothing else in the interface is numbered.

**Built for a bright field.** 17px base text, 46–58px tap targets, icons beside words rather than instead of them, voice output for anyone who reads little.

---

## Honesty and safety

The prompt asks the model to be careful. `backend/safety.py` assumes it sometimes will not be:

- Any sentence containing a dose is **deleted**, not patched — a mangled "Use , per pump" invites a guess.
- A step naming a pesticide banned in India or WHO-classed highly hazardous is **dropped**, and the reply records which one.
- Below 60% confidence, a referral to an agriculture officer is **inserted as step one** even if the model did not offer it.
- The response shape is forced, so the phone can never render half an object.

Patta has **not** been validated against an agronomist-labelled photo set. Until it is, no accuracy claim belongs on a slide. See `docs/SAFETY.md`.

---

## What a pilot would measure

1. Time from noticing a problem to first advice
2. Unnecessary sprays avoided
3. Share of farmers who acted within a day
4. Agreement with an agronomist on a labelled photo set

**Roadmap:** on-device classifier for the top diseases of a few crops → anonymous outbreak map → weather-linked spray and irrigation reminders → officer dashboard with one-tap "ask an expert" → mandi prices.

**SDGs:** Zero Hunger (2), Reduced Inequalities (10), Climate Action (13).

---

## Where each judging criterion lives

| Criterion | Where to look |
|---|---|
| Real-world problem | This page, top; the About tab in the app |
| Innovative solution | Confidence floor and the officer referral — `backend/safety.py` |
| Working prototype | Live diagnosis, voice in and out, history, sample cases |
| Clean, modern UI | Viewfinder-first home, one action colour, `frontend/css/app.css` |
| Responsive design | Test at 390px and 1280px — the layout changes, not just the width |
| Meaningful user flow | `docs/ARCHITECTURE.md`, including every failure path |
| Proper use of technology | Structured JSON contract, server-side safety filter, PWA |
| Real-world impact | Pilot metrics above |

