# Signs needing image sources

These entries in `lib/data/signs.ts` have `imageUnverified: true` and render with an amber asterisk in the catalog. Wikimedia Commons does **not** have a numbered Israeli SVG for any of them (verified by full-category scan + per-file probes on 2026-06-05).

Source options for each:
1. Official **gov.il** Ministry of Transport theory-book PDF — extract figure, save under `public/signs/custom/<id>.svg`.
2. Hand-drawn / commissioned SVG (clearly stylized) under `public/signs/custom/`.
3. Drop the entry entirely.

After dropping a file in `public/signs/custom/`, replace `imageUnverified: true` with `image: "/signs/custom/<id>.svg"`.

## Original 6 (Wikimedia exhausted)

| id | name | category | notes |
|---|---|---|---|
| `w-17` | דרך מתפצלת | אזהרה | Y-fork warning. Israeli warning category covers 101–153, 901–935; none depict a fork. |
| `p-16` | אסורה כניסה לאוטובוסים | איסור | No-bus prohibition. 400-series has no-tractor (410), no-horse (411), no-cyclist (412), no-pedestrian (413), no-truck (415) — no bus. |
| `i-07` | בית חולים | מידע | Hospital. No Israeli SVG. |
| `i-08` | תחנת דלק | מידע | Gas station. No Israeli SVG. |
| `i-11` | מידע לנוסע (i) | מידע | Tourist info "i". 614a/615a/616a only reference tourist sites as a brown-background convention, not the standalone "i" pictogram. |
| `i-13` | תחנת אמבולנס / עזרה ראשונה | מידע | First-aid / ambulance station. No Israeli SVG. |

## Added by audit (2026-06-05)

| id | name | category | reason removed |
|---|---|---|---|
| `w-16` | ערפל | אזהרה | `Israel_road_sign_175.svg` returns HTTP 404 — file does not exist. Israeli warning numbering jumps from 153 to 901; no fog sign in between. |
| `i-09` | מחלף קרוב (מספר) | מידע | Previously used `636.svg`, but that sign actually means "one-way road for motor vehicles; bicycles permitted both directions" (contra-flow cycle lane). Interchange icon not present in info category. |
| `i-12` | מעבר הולכי רגל | מידע | Previously used `631.svg`, but that sign is the supplementary "regulation above applies for N meters" range marker. The pedestrian-crossing info pictogram is not standardized on Commons. |

## Marginal proxies kept in catalog (review later)

| id | name | image | concern |
|---|---|---|---|
| `w-07` | גשר צר | `Israel_road_sign_112L.svg` | 112L is "narrow passage / obstacle" — generic, not specifically a bridge. Replace with a true narrow-bridge pictogram if available. |
| `w-02` | מהמורה | `Israel_road_sign_144.svg` | 144 is "speed bumps" (פסי האטה), plural. "מהמורה" reads as a single bump/pothole. Behavior text is fine; icon is close. |
| `m-15` | שביל אופניים | `Israel_road_sign_227.svg` | 227 is "cyclists only" pictogram. Catalog calls it "שביל אופניים" (bike path). Reasonable but could also use 224 (one-way bike lane) depending on intent. |
