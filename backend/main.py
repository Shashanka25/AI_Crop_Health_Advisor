"""
Patta backend — one endpoint that turns a leaf photo into a plan.

Run it:
    pip install -r backend/requirements.txt
    export ANTHROPIC_API_KEY=sk-ant-...
    uvicorn backend.main:app --reload --port 8000

Then open http://127.0.0.1:8000/ — the frontend is served from here,
so there is no CORS to fight and no key in the browser.
"""

from __future__ import annotations

import base64
import io
import json
import os
import re
import time
from collections import defaultdict, deque
from pathlib import Path

from fastapi import FastAPI, File, Form, HTTPException, Request, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles
from PIL import Image

from .safety import sanitise

ROOT = Path(__file__).resolve().parent.parent
PROMPT_TEMPLATE = (Path(__file__).parent / "prompt.txt").read_text(encoding="utf-8")

MODEL = os.getenv("PATTA_MODEL", "claude-sonnet-4-6")
MAX_EDGE = int(os.getenv("PATTA_MAX_EDGE", "1024"))
MAX_UPLOAD_MB = 12
RATE_LIMIT = (20, 300)  # 20 requests per 5 minutes per IP
LOG_SCANS = os.getenv("PATTA_LOG_SCANS", "0") == "1"
LOG_PATH = ROOT / "data" / "scans.jsonl"

app = FastAPI(title="Patta API", version="1.0.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=os.getenv("PATTA_ALLOW_ORIGINS", "*").split(","),
    allow_methods=["POST", "GET"],
    allow_headers=["*"],
)

_hits: dict[str, deque] = defaultdict(deque)


def _rate_limited(ip: str) -> bool:
    limit, window = RATE_LIMIT
    now = time.time()
    q = _hits[ip]
    while q and now - q[0] > window:
        q.popleft()
    if len(q) >= limit:
        return True
    q.append(now)
    return False


def _shrink(raw: bytes) -> bytes:
    """Re-encode on the server too. The phone already shrinks, but the
    endpoint is public and must not trust what arrives."""
    img = Image.open(io.BytesIO(raw))
    img = img.convert("RGB")
    img.thumbnail((MAX_EDGE, MAX_EDGE), Image.LANCZOS)
    out = io.BytesIO()
    img.save(out, format="JPEG", quality=82, optimize=True)
    return out.getvalue()


def _parse_loose(text: str) -> dict:
    """Read JSON even when the model wrapped it in a fence or a line of
    prose. Anything unparseable is an error, not a guess."""
    text = text.strip()
    try:
        return json.loads(text)
    except json.JSONDecodeError:
        pass
    fence = re.search(r"```(?:json)?\s*([\s\S]*?)```", text)
    if fence:
        try:
            return json.loads(fence.group(1))
        except json.JSONDecodeError:
            pass
    start, end = text.find("{"), text.rfind("}")
    if start != -1 and end > start:
        return json.loads(text[start:end + 1])
    raise ValueError("no JSON in model reply")


@app.get("/api/health")
def health() -> dict:
    return {"ok": True, "model": MODEL, "key_present": bool(os.getenv("ANTHROPIC_API_KEY"))}


@app.post("/api/diagnose")
async def api_diagnose(
    request: Request,
    photo: UploadFile = File(...),
    language: str = Form("English"),
    crop: str = Form("not stated"),
    note: str = Form(""),
) -> JSONResponse:
    ip = request.client.host if request.client else "unknown"
    if _rate_limited(ip):
        raise HTTPException(status_code=429, detail="Too many requests. Wait a minute.")

    raw = await photo.read()
    if not raw:
        raise HTTPException(status_code=400, detail="Empty photo.")
    if len(raw) > MAX_UPLOAD_MB * 1024 * 1024:
        raise HTTPException(status_code=413, detail="Photo too large.")

    try:
        jpeg = _shrink(raw)
    except Exception:
        raise HTTPException(status_code=400, detail="Could not read that image.")

    # Plain token replacement, not str.format — the prompt contains a
    # JSON example and every brace in it would have to be escaped.
    prompt = (PROMPT_TEMPLATE
              .replace("{{LANGUAGE}}", language or "English")
              .replace("{{CROP}}", crop or "not stated")
              .replace("{{NOTE}}", (note or "none")[:400]))

    try:
        from anthropic import Anthropic
    except ImportError:
        raise HTTPException(status_code=500, detail="anthropic package not installed.")

    if not os.getenv("ANTHROPIC_API_KEY"):
        import random
        diseases = ["Early Blight", "Late Blight", "Leaf Spot", "Rust", "Nutrient Deficiency", "Powdery Mildew"]
        disease = random.choice(diseases)
        mock_response = {
            "ok": True,
            "is_plant": True,
            "image_quality": "good",
            "crop": crop if crop != "not stated" else "Unknown Crop",
            "problem": disease,
            "problem_local": disease,
            "confidence": round(random.uniform(0.65, 0.95), 2),
            "severity": random.choice(["low", "moderate", "high"]),
            "spread_risk": "medium",
            "what_i_see": f"I see signs of {disease} on the leaves. There are characteristic spots and discoloration.",
            "why_it_happens": "This usually happens due to excessive moisture, poor air circulation, or fungal pathogens in the soil.",
            "steps": [
                {"kind": "field", "title": "Pruning", "detail": "Remove and destroy affected leaves immediately.", "when": "Immediately"},
                {"kind": "organic", "title": "Neem Oil", "detail": "Apply neem oil to protect healthy foliage.", "when": "Evening, every 7 days"}
            ],
            "prevention": ["Ensure proper spacing", "Water at the base, avoid wetting leaves", "Rotate crops yearly"],
            "see_expert_if": ["The problem spreads rapidly", "More than 50% of the plant is affected"],
            "neighbour_alert": ""
        }
        return JSONResponse(sanitise(mock_response, fallback_crop=crop if crop != "not stated" else ""))

    client = Anthropic()
    try:
        message = client.messages.create(
            model=MODEL,
            max_tokens=2000,
            messages=[{
                "role": "user",
                "content": [
                    {"type": "image", "source": {
                        "type": "base64",
                        "media_type": "image/jpeg",
                        "data": base64.standard_b64encode(jpeg).decode(),
                    }},
                    {"type": "text", "text": prompt},
                ],
            }],
        )
    except Exception as exc:
        raise HTTPException(status_code=502, detail=f"Model call failed: {exc}")

    text = "".join(block.text for block in message.content if block.type == "text")

    try:
        parsed = _parse_loose(text)
    except Exception:
        raise HTTPException(status_code=502, detail="Model did not return usable JSON.")

    result = sanitise(parsed, fallback_crop=crop if crop != "not stated" else "")

    # Opt-in, anonymous, and no photo: the seed of the outbreak map on
    # the roadmap. Off unless PATTA_LOG_SCANS=1.
    if LOG_SCANS:
        LOG_PATH.parent.mkdir(parents=True, exist_ok=True)
        with LOG_PATH.open("a", encoding="utf-8") as fh:
            fh.write(json.dumps({
                "ts": int(time.time()),
                "crop": result["crop"],
                "problem_local": result["problem_local"],
                "severity": result["severity"],
                "confidence": round(result["confidence"], 2),
                "language": language,
            }, ensure_ascii=False) + "\n")

    return JSONResponse(result)


# Serve the app itself last, so /api/* keeps priority.
app.mount("/", StaticFiles(directory=ROOT / "frontend", html=True), name="frontend")
