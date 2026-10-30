# theory-il — אתר לימוד לבחינה העיונית

Next.js study site for the Israeli driver's theory exam (license ב). Hebrew, RTL, mobile-first.
All progress lives in the learner's browser (localStorage) — no accounts, no backend.

## Features

- **Study by topic** — guide + drill for the 4 official topics (1,273 questions), with a signs catalog
- **Instant feedback** — clear right/wrong verdict and a short "why?" explanation (717 text questions so far)
- **Answer shuffling** — options appear in a per-session order so learners learn content, not positions (toggle in Settings)
- **Mock exam** — 30 questions / 40 minutes / pass at 26, official topic mix (12/9/7/2), topic-only and weak-spot modes, retake-your-mistakes
- **Smart review, mistakes, saved** — one `/review` hub ranked by your own history
- **Flashcards** with spaced repetition (SM-2) and a daily 3-question challenge
- **Predicted exam score & pass chance** on `/progress` and the returning-learner home hero
- Light / dark / system theme, backup & restore of progress

## Stack

Next.js 16 (App Router) · React 19 · TypeScript · Tailwind v4 · motion · Vercel.
Note: this Next.js version has breaking changes vs. older docs — see `AGENTS.md`.

## Develop

```bash
npm install
npm run dev
```

Checks:

```bash
npm run check      # typecheck + lint + unit tests (vitest)
npm run build
BASE_URL=http://localhost:3000 npm run test:e2e   # against a running server; uses Playwright's Chromium
```

The e2e smoke test visits every route in light and dark at 390px and fails on console errors,
horizontal overflow or a missing `<h1>`, then walks drill → feedback, exam → results, and the mobile drawer.

## Data

- `lib/data/questions.json` — official Ministry of Transport dataset (data.gov.il, CC-BY). Re-import with
  `npx tsx scripts/fetch-questions.ts` (also regenerates `lib/data/topics.ts`).
- `lib/data/explanations.json` — the site's own study explanations (id → text), loaded lazily on first
  answer reveal and labelled in the UI as unofficial. `npm run generate:explanations` fills missing
  entries with Claude (needs `ANTHROPIC_API_KEY`; never overwrites existing ones) — spot-check before committing.

Performance rule: the question corpus (~700KB) must never be statically imported by a client page —
use `loadCorpus()` from `lib/data/corpus.ts`, or `TOPIC_COUNTS` when you only need totals.

See [`docs/source.md`](docs/source.md) for data provenance.

**Attribution:** שאלות: משרד התחבורה והבטיחות בדרכים, data.gov.il, רישיון CC-BY
