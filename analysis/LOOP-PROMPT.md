> ⚠️ **ARCHIVED (prior run).** STALE — the current loop command is in the orchestrator:
> `docs/superpowers/plans/2026-06-18-overnight-orchestrator.md`.

# The /loop prompt to paste before bed

Copy everything inside the fence below, paste into Claude Code, and hit enter. Omit any interval — the model will self-pace via ScheduleWakeup.

```
/loop You are resuming overnight analysis work on theory-il. Read analysis/STATE.md FIRST every iteration — it is the single source of truth.

Workflow:
1. Read analysis/STATE.md. Identify current phase.
2. If "LOOP COMPLETE" is at the top → stop, do not schedule another wake-up.
3. If there is a Blocker → stop, do not schedule. Leave the blocker for Dany.
4. Otherwise execute the next phase per STATE.md instructions. Use the named superpowers skill for each phase (Phase 1: brainstorming, Phase 2/3: vercel:verification + playwright, Phase 4: writing-plans, Phase 6: code-review).
5. At the end of every iteration: update STATE.md (mark progress, append to Iteration log with timestamp), then ScheduleWakeup for the next iteration unless complete/blocked.

Hard rules (NEVER violate — listed in STATE.md):
- No git push. No Vercel deploy. Local commits only.
- No changes to .env*, vercel config, package.json deps, DB, auth, deploy config, .claude/settings.json.
- Cap implementation to 3 fixes. Everything else stays as proposals in fix-plan.md.
- If uncertain → write blocker in STATE.md and stop.

Tone: do real work, not performance. Don't summarize what you did at the end of each iteration in chat — put it in STATE.md and the analysis docs. Dany will read those in the morning.

Begin.
```

## Notes for Dany

- The loop will self-pace using `ScheduleWakeup` — long delays (20-30 min) between phases is fine. Even a few iterations gets through all 6 phases.
- If you wake up and see "Blocker" in STATE.md, the loop stopped safely.
- If you see "LOOP COMPLETE", read `MORNING-BRIEF.md`.
- Auto-push hook is disabled — nothing will hit GitHub or Vercel.
- To kill mid-run if needed: just interrupt the next wake-up.
