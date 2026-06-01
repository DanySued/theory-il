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
