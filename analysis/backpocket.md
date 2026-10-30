# Backpocket — Phase B backlog (LIVE)

> **This file supersedes the stale `analysis/fix-plan.md` from the prior run.** Treat every
> item below as a SEED, not gospel — **re-verify against the current app before implementing**
> (the app has changed: glossary retired, theme toggle added, /review hub, mobile drawer).
>
> **The orchestrator works this file in Phase B.** Items are ranked top-first. ANALYZE passes
> (persona Playwright walks) append new findings under "From overnight analysis". EXECUTE passes
> take the top un-done, un-gated item, implement + verify + commit, and check it off.
>
> Tags: **persona** · **effort** S/M/L · **risk** low/med/high · **gate** (verify before done)
> Each item ends green (`npx tsc --noEmit`, plus `npm run build` for anything structural) and
> is its own commit. GATED items are NOT run autonomously — they need Dany.

## Legend
- `[ ]` open · `[x]` done · `[~]` in progress · `[!]` blocked (see note) · `[G]` GATED (needs Dany)

---

## Ranked backlog (carried from prior analysis — RE-VERIFY each before doing)

- [x] **BP-01 — Default to "תרגול" tab from homepage CTA** · Yoni · S · low
  - Homepage CTA → `/study/תמרורים?view=drill`; `DrillClient` reads `?view=drill` for initial state.
  - Verify first: confirm current CTA href + that DrillClient still has a `view` state. (was FIX-04)
  - Gate: `npx tsc --noEmit` + Playwright: CTA lands on drill, not catalog.

- [~] **BP-02 — Generate AI explanations for all 1273 questions** · both · L · med · **GATED**
  - 0/1273 questions have explanations; the UI field exists but is empty. Highest leverage.
  - **Do NOT run autonomously:** spends ~$0.13 in API + writes to `lib/data/questions.json` +
    needs a content spot-check. Leave for Dany to greenlight + watch. (was FIX-05)

- [x] **BP-03 — Surface "continue where you left off" in homepage hero** · Yoni · M · low
  - Returning users: read last study position from localStorage, show a personalized hero subtitle
    + continue CTA. Note `ContinueTile` may already exist — verify and reuse, don't duplicate. (was FIX-07)
  - Gate: `npx tsc --noEmit` + Playwright with seeded localStorage.

- [x] **BP-04 — Week-over-week exam score delta on /progress** · Maya · M · low
  - Rolling 7-day exam average from `listAttempts()`, shown as a delta arrow near the readiness card.
  - Verify first: confirm `listAttempts()` + the ReadinessCard exist. (was FIX-08)
  - Gate: `npx tsc --noEmit` + Playwright with seeded attempts.

- ~~BP-05 — Driving vocabulary glossary~~ — **DROPPED.** The standalone `/glossary` was deliberately
  retired (commit c293034). If vocabulary help is wanted, it should be inline tooltips, not a page —
  re-propose only if an ANALYZE pass shows real friction.

---

## From overnight analysis (ANALYZE passes append below — newest first)

_None yet. The first Phase-B ANALYZE pass writes here: persona walk findings + theme audit issues._

---

## Done log

- BP-01 — already in place (home CTA → `?view=drill`); verified 2026-10-30.
- BP-02 — partial: 717/1273 explanations (all text-only questions) in `lib/data/explanations.json`.
  Remaining 556 image questions need a pass that can see the images (`npm run generate:explanations`
  sends them) plus a human spot-check.
- BP-03 — returning-learner home hero (`components/ReturningHero.tsx`).
- BP-04 — week-over-week exam delta inside `components/ReadinessCard.tsx` (`lib/readiness.ts`).
- Also shipped: answer shuffling, explicit feedback, honest readiness model, corpus out of initial
  bundles, Hebrew error/404 pages, unit + e2e tests.
