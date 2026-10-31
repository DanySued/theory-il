# Morning review after the iPhone × Chrome redesign

**Date:** 2026-10-31 (unattended scheduled run) · **Scope:** PR #2 merge + iPhone × Chrome redesign (`a955139..2a2d0b7`)
**Production:** https://theory-il.vercel.app, READY on `239bf20`, smoke-tested after the deploy.

## 1. Situation

- Last night's run finished: PR DanySued/theory-il#2 (`72c5b03`) and PR DanySued/theory-il#3 (`79af082`) are merged.
  `feat/iphone-chrome` is merged as `dd00164`, and its report is at `2026-10-30-iphone-chrome-report.md`.
- At the start, master was level with origin (`2a2d0b7`), with no uncommitted work and no open PRs.
  Nothing needed finishing.

## 2. Deployments

**Access.** The `plugin:vercel` MCP connector worked. The other Vercel connector in this session
(`517128fd…`) returned **403** on `list_deployments` and `get_runtime_errors` for this team, so it
needs re-authorization before it can be used. GitHub statuses agree with the plugin results.

| Deployment | Commit | Target | State |
|---|---|---|---|
| `dpl_2SP9NPtnh1aKt4WJCZkWunDmgZWz` | `2a2d0b7` (start of run) | production | READY |
| `dpl_91mz7ez6Y7DUJZ6vy6AD5VcrbTnh` | `dd00164` redesign merge | production | READY |
| `dpl_6Jp72fCHb7mhPwbPZJ88nb8FKqxb` | `6d5cddf` feat/iphone-chrome | preview | READY |
| `dpl_3ZDRwk7DFpRu86634RQUwCGv8ngv` | `a0a8b3e` fix/iphone-review-2026-10-31 | preview | READY |
| **`dpl_J9wnLYyoG1LQGJdRqUQ6KkQUuNLE`** | **`239bf20` (this run's merge)** | **production** | **READY** |

- **Build log for `2a2d0b7`:** clean. The only warnings come from the npm install step on Vercel's
  side (`cache-dir` env config, `allowScripts` notice for esbuild, sharp and unrs-resolver). They are
  not app warnings, and fixing them would mean changing Vercel settings, which this run doesn't do.
- **Runtime errors in the last 24h:** none (`get_runtime_errors`, since 24h).
- **Previews:** all of the last 8 deployments are READY. None failed.

## 3. Code health

| Check | Result |
|---|---|
| `npx tsc --noEmit` | clean |
| `npm run lint` | clean |
| `npm test` (vitest) | 31/31 |
| `npm run build` | clean, 1299 static pages |
| `npm run test:e2e` against local `next start` | all pass |
| `npm run test:e2e` against production (after the deploy) | all pass |

**Diff review (`a955139..HEAD`):**
- **Dead code:** none. `MobileDrawer`, `ContinueTile` and `FocusMode` are deleted, with no remaining references.
- **PR #2 features are all still wired in:**
  - `Explanation`: QuestionCard, FlashcardRunner, results
  - `ReturningHero`: home / HomeToday
  - `ReadinessCard`: progress
  - `ConfirmDialog`: ExamRunner
  - Answer shuffle (`lib/answerOrder`): exam, retake, QuestionCard, settings
  - The explanation is shown after answering a drill question, verified in WebKit.
- **Hard-coded colors:** only where tokens don't apply. These are the metadata `themeColor`, the
  manifest, the `ImageResponse` icon (`lib/brandMark`) and the print-only stylesheet.
- **RTL:** no physical `ml/mr/pl/pr/left/right` utilities in the changed components.

## 4. Live iPhone QA

**Setup:**
- Playwright 1.63 **WebKit** in a scratch folder, not added to package.json.
- Devices: `iPhone 15`, `iPhone SE` and `iPhone 15 Pro Max`, in light and dark.
- The audit script is committed alongside the screenshots: `analysis/screenshots/iphone-review-2026-10-31/audit.mjs`.

**What each row checks:**
- No horizontal overflow and no console or page errors.
- Visible tap targets are at least 44×44, and inputs are at least 16px.
- There is an `<h1>`.
- The tab bar is shown on browse routes and hidden on focus routes (drill, deck and the running exam).

**Routes (17):** `/`, `/study`, two topic pages, `/study/תמרורים?view=drill`, `/exam`, `/flashcards`,
`/flashcards/בטיחות`, `/review` (all 3 tabs), `/progress`, `/daily`, `/daily/history`, `/settings`,
`/q/0693` and a 404.

**Flows** (iPhone 15, light and dark):
- **Drill:** answer a question; the feedback and the explanation appear.
- **Exam:** start, answer one question and submit. The bottom sheet must be fully on screen and its
  Hebrew must not read "1 שאלות". Then the results page goes through the same checks as the routes.
- **Flashcards:** flip a card.
- **Search sheet:** results appear and the input is 16px.

**PWA:**
- `/manifest.webmanifest`: 200
- `/apple-icon`: 200
- `<link rel="apple-touch-icon">` and `viewport-fit=cover` are present.

**Desktop:** home, drill, exam and progress at 1280×800 have no overflow and look unchanged.

| Run | Result |
|---|---|
| Production before the fixes (`2a2d0b7`) | 113/115: results page had no `<h1>` (light and dark) |
| Local `next start` with the fixes | **115/115** |
| Production after the deploy (`239bf20`) | 114/115. One light-mode results check ran right after the deploy rolled over and read an old copy |
| Production re-check, iPhone 15 light and dark, all routes and flows | **47/47** |

**Visual review against the artboards:**
- The home page on SE dark, the exam confirm sheet, results in dark, the drill with its explanation,
  and desktop home all match the design and last night's screenshots.
- I found no drift in spacing, typography, contrast or dark mode.
- The deviations listed in last night's report (§5) are still intentional.

## 5. Issues found and fixes

| # | Issue | Fix | Commit |
|---|---|---|---|
| 1 | Exam submit confirm read "סימנת 1 שאלות" / "1 שאלות עדיין לא נענו" (open item from last night) | Singular forms "סימנת שאלה אחת" / "שאלה אחת עדיין לא נענתה" | `8c94e18` |
| 2 | Desktop prev/next buttons in the exam and drill had →/← glyphs that screen readers announced | `aria-hidden` on the glyphs | `8c94e18` |
| 3 | `/results/<id>` had no `<h1>` (also true before the redesign), so VoiceOver heading navigation skipped the score | The eyebrow "תוצאות · מבחן תרגול" is now the `h1`. No visual change | `a0a8b3e` |

These were merged with `--no-ff` as **`239bf20`**. The preview and production deploys are both READY.

## 6. Screenshots

All are in `analysis/screenshots/iphone-review-2026-10-31/` and were taken on production after the deploy:
- `prod-flow-*`: drill answered, exam, exam confirm and results, flashcards flipped and search, in light and dark.
- `prod-desktop-*`: home, drill, exam and progress at 1280×800.
- Route samples:
  - `home-iPhone15-light`, `home-iPhoneSE-dark`, `home-iPhone15ProMax-dark`
  - `progress-iPhone15-dark`, `review-iPhone15-light`, `drill-iPhoneSE-light`
  - `deck-iPhone15-dark`, `settings-iPhone15-light`, `404-iPhone15-dark`
- `audit-local.json`, `audit-prod.json` and `audit-prod-recheck.json`: every row with its issues.

## 7. Still open (needs Dany)

- **Vercel MCP connector `517128fd…` returns 403** for team `team_qETaWiRGRXfkKY3DRGELK6Iq`. Re-authorize it,
  or keep using the `plugin:vercel` connector, which works.
- **Real-device pass** on an iPhone in Chrome is still pending. All testing so far is WebKit emulation.
  It should cover the toolbar collapse, the Add to Home Screen standalone launch and the bottom address-bar mode.
- **Exam start CTA** sits just below the fold on iPhone SE. Moving it into an action bar is a design call.
- **Results page** still shows the PageShell "חזרה" back button on phones, as noted last night.
- **The in-app preview server was declined** in unattended mode, so `next start` ran from the shell.
