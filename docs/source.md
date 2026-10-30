# Data Source

## Official Israeli Ministry of Transport Theory Exam Question Bank

**Dataset page:** https://data.gov.il/dataset/tqhe  
**License:** Creative Commons Attribution (CC-BY)  
**Published by:** משרד התחבורה והבטיחות בדרכים (Ministry of Transport and Road Safety)  
**Contact:** tdata@mot.gov.il  
**Last updated:** December 5, 2021

## API Access

No authentication required:

```
GET https://data.gov.il/api/3/action/datastore_search
  ?resource_id=bf7cb748-f220-474b-a4d5-2d59f93db28d
  &limit=1802
```

## Field Schema

| Field | Description |
|---|---|
| `title2` | Question text — prefixed with 4-digit question ID (e.g. `"0641. נהג הרכב..."`) |
| `description4` | HTML blob: 4 `<li>` answer options, correct answer in `<span id="correctAnswer####">`, optional `<img>` tag, license category badges |
| `category` | Topic category (e.g. `חוקי התנועה`, `תמרורים`, `בטיחות`) |

## Filtering for License ב

The `description4` HTML footer contains license category badges. Filter for questions containing `«В»` (Cyrillic В used as ב placeholder).

## Images

Question images are hosted at:
```
https://www.gov.il/BlobFolder/generalpage/tq_pic_01/he/TQ_PIC_NNNN.jpg
https://www.gov.il/BlobFolder/generalpage/tq_pic_02/he/TQ_PIC_NNNN.jpg
```

Images are publicly accessible, government-created traffic diagrams, and covered by the same CC-BY license as the dataset. We hot-link them from gov.il.

## Question Count

- Total in dataset: 1,802 (all license categories)
- License ב subset: ~1,200 questions

## Exam Rules (verified June 2026)

| Rule | Value |
|---|---|
| Questions per exam | 30 |
| Time limit | 40 minutes |
| Passing score | 26 / 30 |

## Attribution Requirement

Per CC-BY license, the site must display:
> "שאלות: משרד התחבורה והבטיחות בדרכים, data.gov.il, רישיון CC-BY"

## Data Freshness

The dataset was last updated December 2021. Post-2021 additions to the bank may not be reflected. Monitor the dataset page for updates or contact tdata@mot.gov.il.

**Verified 2026-10-30:** the ministry's own page
([gov.il theoryexamhe_data](https://www.gov.il/he/departments/dynamiccollectors/theoryexamhe_data))
reads this same dataset through its data.gov.il proxy (1,802 questions), so it is still the
current official bank. Our `questions.json` matches the live ב subset exactly (1,273 questions:
same IDs, text, answers and correct keys). Exam rules (30 questions, 40 minutes, pass at 26)
match [gov.il](https://www.gov.il/he/service/apply_for_new_driver_drivers_license).

## Known source defects (handled in `scripts/fetch-questions.ts`)

| Question | Problem in dataset | Fix |
|---|---|---|
| 0483 | `<img src=` missing its opening quote | parser accepts unquoted src |
| 0120 | src is the placeholder `realistic_visual_road_demo` (text-only question) | dropped |
| 0574, 0907 | src is a placeholder (`ה`, `x`) though the question needs an image | `IMAGE_FIXES` points to the matching gov.il `TQ_PIC_3<id>.jpg`, checked by eye |

## Study content

The study guides (`lib/data/guides.ts`) and the signs catalog (`lib/data/signs.ts`) are written by
us, not taken from the dataset. Rule: state only what the bank gives as a correct answer. Each
guide section lists the question IDs it is based on (`questionIds`); sign names follow the official
sign numbers as used in the bank's "which sign…" questions and `signs-canonical.json`.
