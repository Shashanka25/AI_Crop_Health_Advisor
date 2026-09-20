/* ─────────────────────────────────────────────────────────────
   The one file you edit to connect the app to a model.

   Patta picks the first route that works, in this order:

     1. claude    — running as a published Claude Artifact. Nothing to
                    configure; the viewer's own Claude account answers.
     2. backend   — apiBase is set. The recommended route. Your key
                    stays on the server. Run backend/main.py.
     3. direct    — anthropicKey is set. Convenient for a classroom
                    demo, unsafe anywhere else: the key is visible to
                    anyone who opens DevTools. Never deploy this.
     4. samples   — nothing configured, or the network failed. The two
                    built-in cases answer instead, so the demo never
                    dies on stage.
   ───────────────────────────────────────────────────────────── */

export const CONFIG = {
  // e.g. 'http://127.0.0.1:8000' while developing, '' when the API is
  // served from the same origin as the page.
  apiBase: '',

  // Leave empty. Only fill this for a local demo you will not publish.
  anthropicKey: '',

  model: 'claude-sonnet-4-6',

  // Longest edge, in pixels, after the phone shrinks the photo.
  // 1024 keeps leaf texture readable and still uploads on a weak signal.
  maxEdge: 1024,
  jpegQuality: 0.82,

  // Below this, the app stops giving advice and sends the farmer to an
  // agriculture officer instead.
  confidenceFloor: 0.6,

  kisanCallCentre: '1800-180-1551',

  // Cap on locally stored scans, so a cheap phone never fills up.
  historyLimit: 30
};
