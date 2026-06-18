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

- [ ] **BP-01 — Default to "תרגול" tab from homepage CTA** · Yoni · S · low
  - Homepage CTA → `/study/תמרורים?view=drill`; `DrillClient` reads `?view=drill` for initial state.
  - Verify first: confirm current CTA href + that DrillClient still has a `view` state. (was FIX-04)
  - Gate: `npx tsc --noEmit` + Playwright: CTA lands on drill, not catalog.

- [G] **BP-02 — Generate AI explanations for all 1273 questions** · both · L · med · **GATED**
  - 0/1273 questions have explanations; the UI field exists but is empty. Highest leverage.
  - **Do NOT run autonomously:** spends ~$0.13 in API + writes to `lib/data/questions.json` +
    needs a content spot-check. Leave for Dany to greenlight + watch. (was FIX-05)

- [ ] **BP-03 — Surface "continue where you left off" in homepage hero** · Yoni · M · low
  - Returning users: read last study position from localStorage, show a personalized hero subtitle
    + continue CTA. Note `ContinueTile` may already exist — verify and reuse, don't duplicate. (was FIX-07)
  - Gate: `npx tsc --noEmit` + Playwright with seeded localStorage.

- [ ] **BP-04 — Week-over-week exam score delta on /progress** · Maya · M · low
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

_Empty. EXECUTE passes move completed items here with their commit hash._
