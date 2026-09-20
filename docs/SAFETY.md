# Safety design

The worst thing this project can do is make a farmer spend money on the wrong chemical, or spray the right one at the wrong strength. Everything below exists for that reason.

## Three layers

**1. The prompt** (`backend/prompt.txt`, mirrored in `frontend/js/prompt.js`)

- Report real confidence. A photo that could be three things gets a low number.
- Consider nutrient problems, water stress, heat and pest damage before naming a pathogen — they look like disease.
- Order advice: field care, then natural or biological, then chemical.
- Active ingredient only. No brand. No dose, concentration, or litres per acre.
- Nothing banned in India or WHO-classed highly hazardous.

**2. The server filter** (`backend/safety.py`) — assumes layer 1 sometimes fails

- Any sentence containing a dose is deleted whole. Removing just the number leaves "Use , per pump", which reads like a typo and invites a guess.
- A step naming a banned active is dropped, and the response records which one in `filtered`.
- Below 60% confidence, an agriculture-officer referral is inserted as step one, even if the model did not offer it.
- Every field is type-checked and clamped; steps are re-sorted so chemicals are always last.

**3. The interface**

- Confidence is shown as a number and a bar, not hidden behind a label.
- Low confidence gets a red caution block above the plan, not a footnote.
- "See an expert if" is always present.
- Where a chemical step exists, the screen says the dose was left out on purpose and points to the label and the local officer.
- The Kisan Call Centre number is one tap away on every result.

## What is deliberately not in the app

- **Doses.** They depend on formulation, crop stage, equipment and water volume. A number on a phone screen cannot know any of that.
- **Brand names.** Recommending a brand is selling.
- **Buy links.** Same reason.
- **A number to describe accuracy.** Patta has not been validated against an agronomist-labelled photo set. Until it has, no accuracy claim belongs on a slide.

## Before any real pilot

1. Have an agronomist label a photo set and measure agreement. Publish the number, whatever it is.
2. Have a native Telugu speaker and a native Hindi speaker read every line in `i18n.js` and every sample case. Machine-shaped agricultural wording reads fine and advises badly.
3. Refresh `BANNED_ACTIVES` from the current CIB&RC list.
4. Run it past the local agriculture department before a single farmer sprays on its word.

## Privacy

No account. No login. Scans and photos stay in the phone's own storage and are never uploaded. The anonymous scan log in the backend (crop, problem, severity, date — never a photo, never a location) is switched off unless `PATTA_LOG_SCANS=1`, and exists only as the seed of the outbreak map on the roadmap.
