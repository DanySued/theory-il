# theory-il — אתר לימוד לבחינה העיונית

Next.js study site for the Israeli driver's theory exam (license ב).

## Features

- Browse the official question bank by topic (study mode)
- Timed mock exam: 30 questions, 40 minutes, pass at 26/30
- Review results with correct answers

## Stack

Next.js · TypeScript · Tailwind CSS · Vercel

## Data

Questions from the official Ministry of Transport dataset on data.gov.il (CC-BY).  
See [`docs/source.md`](docs/source.md) for full provenance and license details.

**Attribution:** שאלות: משרד התחבורה והבטיחות בדרכים, data.gov.il, רישיון CC-BY

## Setup

No local dev needed — push to `main` and Vercel auto-deploys.

To re-import questions from the official source:

```bash
npx ts-node scripts/fetch-questions.ts
```

This writes `lib/data/questions.json`.
