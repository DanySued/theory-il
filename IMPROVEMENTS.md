# theory-il — improvement plan

Actionable improvements grouped by skill/plugin domain. Each item names the relevant skill so the implementer can invoke it for deep guidance.

---

## 1. Design quality — `frontend-design`

The current UI is functional but generic (single accent color, identical card styles across pages). The frontend-design skill specializes in distinctive, production-grade interfaces.

- **Home page hero.** Replace the centered text-only hero with a visual identity: a subtle Hebrew-typography wordmark, a static "sign wall" backdrop using the existing SVG signs as a faded mosaic, and a clearer primary CTA hierarchy ("התחל מבחן" as primary, study/flashcards as secondary).
- **Exam start screen.** Currently a plain `<select>`. Upgrade to a topic-tile grid (4 large cards with category color + question count + last-attempt score per category). Reuse `CATEGORY_COLOR` from `SignsCatalog.tsx`.
- **Results page banner.** The 6xl number + colored background is loud. Replace with a circular score ring (SVG, animated stroke-dashoffset) on the right with a clean stat list on the left: correct/total, time, category breakdown.
- **Empty/loading states.** Currently bare text ("טוען…", "לא נמצא"). Add skeleton shimmer for results loading and a friendlier 404 illustration page.
- **Dark mode polish.** Audit hardcoded colors (`bg-green-50/40`, `bg-red-50/40` in `app/results/[id]/page.tsx`) — these don't have dark variants. Replace with semantic CSS vars or add `dark:` siblings.

**Run:** `Skill frontend-design` and feed it `app/page.tsx`, `app/exam/page.tsx`, `app/results/[id]/page.tsx` for redesigns.

---

## 2. React/TSX quality — `vercel:react-best-practices`

Run this after touching multiple TSX files. Known issues likely to surface:

- `ExamRunner.tsx` has many refs that mirror state (`answersRef`, `markedRef`, `secondsRef`, `submittedRef`). React 19 + the `use` hook can simplify; alternatively factor the timer into a custom `useExamTimer(noTimer, onElapsed)` hook.
- `SignsCatalog.tsx` and `ExamRunner.tsx` are 300+ lines — split out `SignCard`, `ExamTopBar`, `ExamNavigator`, `ExamSubmitDialog`.
- Several effects update state and then save to localStorage in the same effect (`recordAnswersBatch` + `saveAttempt` in results page) — wrap in a single `useEffect` with proper guard rails.
- Accessibility audit: `<button>`s with only icon (share, export) need `aria-label`; the question navigator dots need `aria-label="שאלה N"` and a `<nav>` wrapper.

---

## 3. Performance — `vercel:next-cache-components` + `vercel:turbopack`

- `app/study/page.tsx` and `app/exam/page.tsx` load the full `questions.json` (~1300 entries) on every navigation. Use the **`use cache` directive** with a topic-scoped cache tag so per-topic question lists are memoized at the route segment level.
- `lib/data/questions.json` is bundled into the client for `/exam` (the start screen). Split it by topic at build time into 4 JSON files (`questions.חוקי-התנועה.json`, etc.) and dynamically `import()` only the selected topic's pool when the user picks. Saves ~600KB on first paint.
- Image strategy: replace `<img src={W(...)}>` for Wikimedia signs with Next's `<Image>` + `next.config.js` `remotePatterns` for `commons.wikimedia.org`. Enables format negotiation (AVIF) and lazy loading.
- Run `npx next build` and inspect the route-segment bundle report; target < 100 KB JS per route.

**Run:** `Skill vercel:next-cache-components` for `use cache`/`cacheLife`/`cacheTag` migration patterns.

---

## 4. Data layer & persistence

Today all attempts/streaks/qstats live in `localStorage`. This blocks two real features:

- **Cross-device sync.** A casual user studies on phone, tests on laptop. Add Vercel-Marketplace Postgres (Neon) + a tiny auth (Clerk via Marketplace) so attempts sync. **Run:** `Skill vercel:auth` and `Skill vercel:vercel-storage`.
- **Spaced repetition gets smarter.** `lib/srs.ts` exists but per-question stats are isolated. With server-side storage, you can compute "weakest topics" across all sessions and surface a "מבחן חולשות" mode that targets the user's lowest-mastery questions.

**Migration order:** keep localStorage as fallback; add Postgres write-through; later remove localStorage.

---

## 5. UX features (concrete adds)

- **Exam review mode.** After viewing results, let the user re-enter the exam in "study mode" with all answers visible — useful for re-reading explanations without taking a new test.
- **Per-question explanation.** `Question` type has no `explanation` field. Add one (use Gemini to bulk-generate Hebrew explanations from the question + correct answer, then ship as static data). Show on results-page review and on flashcards.
- **Bookmark questions.** Star icon on any question → saved list at `/saved`. Survives across attempts.
- **Time-pressure mode.** Optional 90-second-per-question hard cutoff to simulate stricter exam pacing.
- **Progress dashboard.** `/dashboard` route: streak, last 10 attempt scores as sparkline, per-topic accuracy, weakest 5 questions. Renders from existing `qstats` localStorage data.
- **Keyboard shortcuts in exam.** Already partially possible — add 1/2/3/4 to select answer א/ב/ג/ד, ←/→ to navigate, M to mark, S to submit.

---

## 6. Deployment & CI — `vercel:deployments-cicd` + `vercel:vercel-cli`

- Project isn't linked to Vercel yet (no `.vercel/` directory in repo). Link with `vercel link`, then set up preview deployments per PR. **Run:** `Skill vercel:deploy`.
- Add a GitHub Action that runs `scripts/validate-signs.ts` on every PR — blocks merges that re-introduce broken Wikimedia image URLs or sign-title mismatches.
- Add `npm run build` to the same action to catch type errors before merge (`npx tsc --noEmit` alone misses Next-specific build failures).

---

## 7. Quality gates already discovered (low-hanging)

From the prior reviewer pass on `9c3edf7`:

- BackButton lacks `aria-label`. Add `aria-label="חזרה לדף הקודם"`.
- `app/exam/page.tsx` lost its `<title>` after the client conversion. Create `app/exam/layout.tsx` (server) exporting `metadata: { title: "מבחן מדומה — תיאוריה" }` and similarly for other client pages that need per-route titles.
- `shuffle()` is duplicated in `lib/exam.ts` and `app/exam/retake/[sourceId]/page.tsx`. Export it once from `lib/exam.ts`.
- `exportAttemptToDocx` uses `correct/total >= 26/30` for the green color even on non-30 retake exams, while the on-screen banner is neutral for non-30. Pick one rule (recommend: green only when `isFullExam && passed`).
- Pre-existing lint baseline (10 errors / 3 warnings) is mostly `set-state-in-effect`. Worth a focused cleanup pass.

---

## 8. Sign catalog — finish the unverified 8

Independent track from the rest. 8 signs still render image-less with an amber asterisk: w-07, w-17, w-18, p-16, i-07, i-08, i-11, i-13. None have standalone numbered equivalents in Israel's official sign catalog (Wikimedia route is exhausted — verified). Options:

- **Source the official gov.il theory-book PDF** and extract the matching figures as SVG, host under `public/signs/custom/`.
- **Commission generic vector icons** that visually represent the concept (e.g. a hospital cross) — clearly stylized so it doesn't pretend to be an official sign.
- **Drop the 8 entries** from the catalog with a footnote that the official Israeli theory exam doesn't include them.

Recommend option 1 — gives full coverage with authentic visuals.

---

## Suggested execution order

1. **Quick wins** (½ day) — section 7: aria-label, metadata layouts, dedup shuffle, color rule.
2. **Design pass** (1–2 days) — section 1 via `frontend-design`.
3. **Performance pass** (1 day) — section 3 split-by-topic JSON + `use cache`.
4. **Data layer** (2–3 days) — section 4: auth + Postgres + sync.
5. **New features** (incremental) — section 5 in priority of bookmarks → keyboard → dashboard → explanations.
6. **Deploy + CI** (½ day) — section 6.
7. **Sign coverage** (separate decision) — section 8.
