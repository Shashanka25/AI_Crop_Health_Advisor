"""
The model is asked to be safe in the prompt. This file assumes it
sometimes will not be.

Three jobs:
  1. strip anything that reads like a dose,
  2. refuse to pass on a pesticide that is banned in India or classed
     by the WHO as highly hazardous,
  3. force the shape of the response so the phone never renders half
     an object.

A farmer acting on a wrong dose is the worst thing this project can
do. That is why this runs on the server, after the model, every time.
"""

from __future__ import annotations

import re
from typing import Any

# Banned or severely restricted in India, plus WHO Class Ia/Ib actives
# that still turn up in village shops. Not exhaustive — treat it as a
# floor, and refresh it from the CIB&RC list before any real pilot.
BANNED_ACTIVES = {
    "monocrotophos", "phorate", "methyl parathion", "parathion", "phosphamidon",
    "endosulfan", "carbofuran", "aldicarb", "dichlorvos", "ddvp", "triazophos",
    "methomyl", "benfuracarb", "carbosulfan", "thiometon", "trichlorfon",
    "quinalphos", "alachlor", "dicofol", "methyl bromide", "paraquat",
    "sodium cyanide", "captafol", "chlordane", "heptachlor", "lindane",
    "ethyl mercury chloride", "menazon", "nitrofen", "pentachlorophenol",
    "phenyl mercury acetate", "tetradifon", "toxaphene", "chlorfenapyr",
}

# A dose is a number next to a unit. Percentages and ppm are kept:
# they describe a product's formulation, not how much to mix.
DOSE = re.compile(
    r"\b\d+(?:[.,]\d+)?\s*(?:ml|mL|l|L|litres?|liters?|g|gm|gms|grams?|kg|"
    r"tsp|tbsp|teaspoons?|tablespoons?)\b"
    r"(?:\s*(?:per|/|a)\s*(?:l|L|litre|liter|acre|hectare|ha|tank|pump|plant|sq\.?\s?m)\b)?",
    re.IGNORECASE,
)

BRAND_MARK = re.compile(r"[®™]")

VALID_KINDS = ("field", "organic", "chemical")
KIND_ORDER = {"field": 0, "organic": 1, "chemical": 2}


def strip_dose(text: str) -> str:
    """Drop any sentence that carried a dose.

    Deleting just the number leaves "Use , per pump", which reads like a
    typo and invites the farmer to guess. A sentence with a dose in it
    exists to give a dose, so the whole sentence goes and the rest of
    the advice stands.
    """
    if not text:
        return ""
    text = BRAND_MARK.sub("", text)
    kept = [
        part for part in re.split(r"(?<=[.!?।])\s+", text)
        if part.strip() and not DOSE.search(part)
    ]
    cleaned = " ".join(kept)
    cleaned = re.sub(r"\s+([.,;])", r"\1", cleaned)
    return re.sub(r"\s{2,}", " ", cleaned).strip(" ,;")


def mentions_banned(text: str) -> str | None:
    low = (text or "").lower()
    for active in BANNED_ACTIVES:
        if re.search(rf"\b{re.escape(active)}\b", low):
            return active
    return None


def _clamp(value: Any, lo: float, hi: float, default: float) -> float:
    try:
        return max(lo, min(hi, float(value)))
    except (TypeError, ValueError):
        return default


def _one_of(value: Any, allowed: tuple[str, ...], default: str) -> str:
    return value if value in allowed else default


def _text(value: Any, limit: int = 1200) -> str:
    return str(value).strip()[:limit] if isinstance(value, str) else ""


def _lines(value: Any, cap: int = 6) -> list[str]:
    if not isinstance(value, list):
        return []
    return [_text(v, 300) for v in value if _text(v, 300)][:cap]


def sanitise(raw: dict, fallback_crop: str = "") -> dict:
    """Shape-check and safety-check one model reply. Never raises."""
    data = raw if isinstance(raw, dict) else {}
    removed: list[str] = []

    steps = []
    for step in (data.get("steps") or [])[:6]:
        if not isinstance(step, dict):
            continue
        title = _text(step.get("title"), 160)
        if not title:
            continue
        detail = _text(step.get("detail"), 600)

        banned = mentions_banned(f"{title} {detail}")
        if banned:
            # Do not try to rewrite the step. Drop it and say why.
            removed.append(banned)
            continue

        steps.append({
            "kind": _one_of(step.get("kind"), VALID_KINDS, "field"),
            "title": strip_dose(title),
            "detail": strip_dose(detail),
            "when": _text(step.get("when"), 80),
        })

    steps.sort(key=lambda s: KIND_ORDER[s["kind"]])

    confidence = _clamp(data.get("confidence"), 0.0, 1.0, 0.5)

    result = {
        "ok": data.get("ok") is not False,
        "is_plant": data.get("is_plant") is not False,
        "image_quality": _one_of(data.get("image_quality"), ("good", "poor"), "good"),
        "retake_tip": _text(data.get("retake_tip"), 240),
        "crop": _text(data.get("crop"), 80) or fallback_crop,
        "problem": _text(data.get("problem"), 160) or "—",
        "problem_local": _text(data.get("problem_local"), 160),
        "confidence": confidence,
        "severity": _one_of(data.get("severity"), ("low", "moderate", "high"), "moderate"),
        "spread_risk": _one_of(data.get("spread_risk"), ("low", "medium", "high"), "low"),
        "what_i_see": _text(data.get("what_i_see")),
        "why_it_happens": _text(data.get("why_it_happens")),
        "steps": steps,
        "prevention": [line for line in (strip_dose(p) for p in _lines(data.get("prevention"))) if line],
        "see_expert_if": _lines(data.get("see_expert_if")),
        "neighbour_alert": _text(data.get("neighbour_alert"), 240),
        "filtered": sorted(set(removed)),
    }

    # If the model was unsure, the first thing on screen is a person,
    # not a product. This is enforced here as well as in the prompt.
    if confidence < 0.6:
        referral = {
            "kind": "field",
            "title": "Show this leaf to an agriculture officer first",
            "detail": (
                "The reading is not confident enough to act on. Take this leaf "
                "or this photo to your nearest agriculture officer or the Kisan "
                "Call Centre before buying or spraying anything."
            ),
            "when": "today",
        }
        if not steps or "officer" not in steps[0]["title"].lower():
            result["steps"] = [referral] + steps

    return result
