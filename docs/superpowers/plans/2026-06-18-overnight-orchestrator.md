# Overnight Orchestrator — theory-il (2026-06-18)

> **READ THIS FILE FIRST, EVERY ITERATION. It is the single source of truth.**
> It supersedes the prior run's `analysis/STATE.md`, `analysis/LOOP-PROMPT.md`,
> `analysis/MORNING-BRIEF.md`, and `analysis/fix-plan.md` — treat those as STALE history.
> Update this file's **State** + **Iteration log** at the END of every iteration.

## RUN STATUS: ACTIVE
<!-- When the run is truly finished, replace the line above with: RUN STATUS: COMPLETE -->

## State (the loop reads + writes these)
- **Phase:** A  <!-- A = execute the plan · B = backpocket -->
- **Last Phase-B pass:** (none yet)  <!-- ANALYZE | EXECUTE — used to intercalate in Phase B -->
- **Global halt:** NO  <!-- YES only for a hard-rule violation; see Safety -->

---

## What this loop does
Run autonomous overnight work on theory-il (Hebrew RTL driving-theory study app). Two phases:

1. **Phase A — execute the plan.** Work `docs/superpowers/plans/2026-06-18-theming-and-hardening.md`
   task-by-task until every checkbox is ticked.
2. **Phase B — backpocket, intercalating.** Once the plan is done, alternate each iteration between
   an **ANALYZE** pass (persona Playwright walk → append findings) and an **EXECUTE** pass (implement
   the top backpocket item). Backlog: `analysis/backpocket.md`.

Pacing is **self-paced** via `ScheduleWakeup` (no fixed interval). On a hard failure the loop
**isolates and keeps moving** — it does not stall the night.

---

## Per-iteration algorithm

```
1. Read THIS file. If "RUN STATUS: COMPLETE" or "Global halt: YES" → STOP, do not ScheduleWakeup.
2. Determine PHASE from State + the plan file:
     - If the plan (theming-and-hardening) has ANY unchecked `- [ ]` task → PHASE A.
     - Else → PHASE B.
3. PHASE A:
     a. Take the FIRST unchecked task in the plan.
     b. Implement it using superpowers:subagent-driven-development
        (dispatch a subagent per the task's steps; for 2+ independent steps use
         superpowers:dispatching-parallel-agents).
     c. GATE: run the task's stated verify (`npx tsc --noEmit`, plus `npm run build`/`npm run lint`
        where the task says so). Must be GREEN.
     d. Commit with the task's message. Tick the task's checkbox.
     e. Go to step 6.
4. PHASE B — pick pass type from "Last Phase-B pass":
     - If "(none yet)" or "EXECUTE" → do an **ANALYZE** pass:
         * Ensure a dev server is up (start `npm run dev` in background if needed; port 3000).
         * Use superpowers:verification (or vercel:verification) + Playwright @390×844.
         * Walk the app as a persona (alternate Yoni=Oleh Chadash / Maya=Sophomore; see
           analysis/personas.md for scripts — RE-VERIFY, app has changed). Assert no console.error,
           no horizontal scroll, pages render. Try BOTH themes.
         * Append concrete findings to analysis/backpocket.md ("From overnight analysis", newest first),
           each ranked with effort/risk/gate. Do NOT implement during an ANALYZE pass.
         * Set "Last Phase-B pass: ANALYZE".
     - If "ANALYZE" → do an **EXECUTE** pass:
         * Take the TOP open, non-GATED item in analysis/backpocket.md.
         * RE-VERIFY its assumptions against current code FIRST (don't trust the seed text).
         * Implement via subagent-driven-development. GATE green. Commit. Check it off + move it to
           the backpocket "Done log" with the commit hash.
         * Set "Last Phase-B pass: EXECUTE".
     - If Phase B has NOTHING to do (no unchecked plan tasks AND every backpocket item is done/GATED
       AND the last ANALYZE found no new findings) → go to "Finishing the run" below.
5. (handled inside 3/4)
6. END OF ITERATION (always):
     - Update State (Phase, Last Phase-B pass) + append a row to the Iteration log with a timestamp.
     - If not COMPLETE/halted: ScheduleWakeup (see Pacing). Then STOP this turn.
     - Do NOT narrate a summary in chat — put everything in this file + the docs. Dany reads these.
```

## Pacing (ScheduleWakeup, self-paced)
- Default idle between iterations: **1200–1800s** (20–30 min). Real work per wake, not busy-polling.
- If actively waiting on a build/deploy you just triggered: **~270s** (stay in cache).
- Always pass the same /loop input back so the next firing re-enters this orchestrator.

## Safety — isolate & keep moving
- **An iteration NEVER ends on a red build.** If a task/item fails its gate:
  1. Make ONE focused fix attempt.
  2. If still red → `git restore`/revert that unit's changes (leave the tree green), mark the item
     `[!]` with a one-line BLOCKED note + the error in the plan or backpocket, and skip to the next
     safe item. The night continues.
- **Global halt (set "Global halt: YES", STOP, leave it for Dany) ONLY for a hard-rule risk:**
  changes that would touch `.env*`, `vercel.json`/`vercel.ts`, `package.json` dependencies, DB
  schema, auth, deploy config, or `.claude/settings.json`; or anything that spends money
  (e.g. backpocket BP-02 AI generation is **GATED** — never run it autonomously).
- Each green iteration commits; the auto-push Stop hook pushes → deploys to production Vercel. That
  is intended this run. Because every iteration is build-green before commit, only green ships.

## Finishing the run (organize + push, then stop)
When there is genuinely nothing left (plan done + backpocket exhausted of non-gated items + ANALYZE
finds nothing new):
1. **Freshness pass** — update this file, refresh/replace the stale prior-run docs so `analysis/`
   reflects reality (rewrite `analysis/MORNING-BRIEF.md` for THIS run; the old fix-plan is superseded
   by backpocket.md).
2. Ensure everything is committed (auto-push will push). 
3. Set **RUN STATUS: COMPLETE** at the top. Do NOT ScheduleWakeup. End.

---

## Skills per activity
- Plan execution → `superpowers:subagent-driven-development` (+ `dispatching-parallel-agents`)
- ANALYZE passes → `superpowers:verification` / `vercel:verification` + Playwright MCP
- Adding new backpocket items → keep ranked; `superpowers:writing-plans` if an item needs a sub-plan
- Before claiming done → `superpowers:verification-before-completion`
- Optional self-review on a big change → `superpowers:requesting-code-review`

## Pointers
- Plan: `docs/superpowers/plans/2026-06-18-theming-and-hardening.md`
- Backpocket: `analysis/backpocket.md`
- Personas (re-verify): `analysis/personas.md`
- App: Next.js App Router, RTL, localStorage only, dev on `npm run dev` :3000. Routes: `/`, `/study`,
  `/study/[topic]`, `/exam`, `/flashcards`, `/flashcards/[topic]`, `/daily`, `/daily/history`,
  `/review`, `/progress`, `/results/[id]`, `/q/[id]`, `/settings`.

---

## Iteration log
| # | Timestamp (IL) | Phase | Pass | What happened | Commit |
|---|----------------|-------|------|---------------|--------|
| 0 | 2026-06-18 setup | — | — | Orchestrator + plan + backpocket created; in-flight theme work committed (c293034). Loop armed. | c293034 |
