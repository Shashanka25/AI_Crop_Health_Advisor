# Architecture

## The flow, end to end

```
 Open the app
    │
    ├─ pick language (EN / తె / हि)  ── the whole interface and the model's answer change
    │
    ├─ take a photo  or  choose from gallery  or  drag and drop on desktop
    │       │
    │       └─ on the phone: shrink to 1024px, then three cheap checks
    │             brightness  → "too dark to read"
    │             sharpness   → "hold still and take it again"   (variance of Laplacian)
    │             leaf colour → "that does not look like a plant"
    │
    ├─ (optional) tap a crop, speak or type a note
    │
    ├─ Diagnose ─────────────────────────────────────────────┐
    │       │                                                │
    │       ├─ scan animation, Cancel available at any time   │
    │       │                                                │
    │       ▼                                                │
    │   route resolution (first one that works)               │
    │     1. Claude Artifact runtime   (viewer's own account) │
    │     2. your backend             (key stays on server)   │
    │     3. direct API call          (demo only, key visible)│
    │     4. built-in sample cases    (no network needed)     │
    │       │                                                │
    │       ▼                                                │
    │   vision model → JSON → safety filter → normalise      │
    │                                                         │
    ├─ result ◄───────────────────────────────────────────────┘
    │     problem · severity · confidence · spread risk
    │     what I see · why it happens
    │     numbered plan: field care → natural → chemical
    │     prevention · see an expert if · tell your neighbours
    │       ├─ Listen      (speech synthesis in the chosen language)
    │       ├─ Share       (share sheet, or clipboard for WhatsApp)
    │       ├─ Was this helpful?
    │       └─ Call Kisan Call Centre  1800-180-1551
    │
    ├─ saved to "My scans" on the device
    └─ Scan another leaf
```

## Failure paths, and what each one shows

| What happened | What the farmer sees |
|---|---|
| Photo too dark | "Too dark to read. Move into daylight and try again." |
| Photo blurry | "Hold still, tap the leaf to focus, and take it again." |
| Not a plant | "That does not look like a plant. Photograph a leaf, filling the frame." |
| Network down | The sample case appears, with "Offline — showing a saved sample case." |
| Rate limited | "Too many requests right now. Wait a minute and try again." |
| Model returned junk | Sample case, plus "Something went wrong. Try again." |
| Cancelled mid-scan | Back to the viewfinder. "Stopped. Nothing was saved." |
| No voice for the language | "This phone has no voice for this language. Install it in Settings, or read the text." |
| Speech recognition missing | The mic hint says to type instead; the field still works. |

The rule behind all of these: the farmer is never left on an error screen with nothing to do next.

## The JSON contract

Every route returns the same object. `backend/safety.py` and `normalise()` in `frontend/js/api.js` both enforce it, so a malformed reply can never render half an interface.

```jsonc
{
  "ok": true,
  "is_plant": true,
  "image_quality": "good",        // "good" | "poor"
  "retake_tip": "",               // only when image_quality is "poor"
  "crop": "Tomato",
  "problem": "Early blight",      // farmer's language
  "problem_local": "Alternaria",  // scientific / English, for the officer
  "confidence": 0.82,             // real confidence, 0–1
  "severity": "moderate",         // low | moderate | high
  "spread_risk": "medium",        // low | medium | high
  "what_i_see": "...",
  "why_it_happens": "...",
  "steps": [
    { "kind": "field",            // field | organic | chemical — always sorted in that order
      "title": "Remove the worst leaves today",
      "detail": "...",
      "when": "Today" }
  ],
  "prevention":    ["...", "..."],
  "see_expert_if": ["...", "..."],
  "neighbour_alert": "...",
  "filtered": []                  // banned actives the server removed, if any
}
```

## Why these choices

**Structured JSON, not prose.** One model call returns the diagnosis, the plan and the translation together. Prose would have to be parsed, and a parser that half-works on a farmer's phone is worse than no parser.

**Image work on the device.** A 12 MP photo becomes about 150 KB before it touches the network. The quality checks run there too, so a photo that cannot be judged never costs a round trip — or a farmer's patience on a weak signal.

**Safety on the server.** The prompt is the first line of defence and the filter is the second. A prompt can be talked around; a regex and a banned list cannot.

**localStorage, not a database.** There is no account, so there is nothing to leak. History works offline because it never left.

**Service worker caches the shell only.** Diagnosis genuinely needs the network and the app says so, rather than pretending to work and failing quietly.
