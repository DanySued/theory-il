# iPhone × Chrome adaptation: run report

**Date:** 2026-10-30 (evening autonomous run) · **Plan:** `docs/superpowers/plans/2026-10-30-iphone-chrome.md`
**Design:** Claude Design canvas (`docs/design/iphone-chrome/*.dc.html`)
**Production:** https://theory-il.vercel.app, serving the new mobile UI, verified after the deploy.

## 1. PR #2 merge result

PR DanySued/theory-il#2 was already **merged** (72c5b03) before this run, and PR #3 too (79af082).
Local master was level with origin, so the run took the "already merged → pull" path. The plan files
were committed on master as `3def6ad docs: iPhone × Chrome adaptation plan + Claude Design mockups`.
Nothing needed reconciling.

## 2. What shipped

Branch `feat/iphone-chrome` was merged into master with `--no-ff` as **`dd00164`**. The Vercel
preview for `6d5cddf` was green, and the production deploy of `dd00164` was green.

| Commit | Step | Summary |
|---|---|---|
| `0777297` | 1 Foundations | Mobile tokens, 16px gutters, tap/overscroll base rules, `(hover:hover)` gate on `.th-card-hover`, `app/manifest.ts`, `icon.tsx` (64/192/512 via `generateImageMetadata`), `apple-icon.tsx` (accent + white ת), `appleWebApp`/`formatDetection`, `suppressHydrationWarning` on `<html>`, dvh in global-error |
| `d4817c9` | 2 Navigation shell | `BottomTabBar` (5 tabs, `aria-current`, safe area, view-transition anchored), focus mode (CSS `:has` on a marker, so no flash), 56px phone header (logo · streak with Flame icon · search · settings gear), full-screen search sheet (16px input, 48px rows, scroll lock, `pointerdown`), `MobileDrawer` deleted |
| `9292ead` | 3 Focus screens | `FocusHeader` / `FocusActionBar`. Drill: segmented control, 56px rows, feedback strip, star in header, swipe clipped. Exam: X · timer pill · הגשה, status row, 44px question map, radio rows, prev · סמן · הבאה/הגשה. Flashcards: full-height card, rating bar with real SRS hints. `ConfirmDialog` as bottom sheet |
| `c7dfcdc` | 4 Browse screens | Phone home (compact hero, start/continue card, real-data stat tiles, 60px daily row, 2×2 modes), progress (ring card, topic-accuracy card, exam rows with pass/fail chips), review segmented tabs, results bottom bar, all targets ≥44px |
| `cd80038` | 5 Polish | `--th-success-fg` / `--th-error-fg`: text on the soft fills is now ≥4.5:1 in light mode (was ~3:1) |
| `fcae9da` | Self-review | Simplify pass (4 parallel reviewers: reuse/simplification/efficiency/altitude); see §6 |
| `6d5cddf` | 6 Verification | Curated screenshots + `audit.json` |

## 3. Verification

Tools: Playwright **WebKit** (1.63, scratch folder, not added to package.json) with
`devices['iPhone 15' | 'iPhone SE' | 'iPhone 15 Pro Max']`, run against `next build && next start`.

- `npx tsc --noEmit` clean · `npm run lint` clean · `npm test` 31/31 · `npm run build` clean.
- `npm run test:e2e` passes locally and against production, in light and dark.
  The drawer check was replaced by search-sheet and tab-bar checks; the exam submits via the visible button.
  No assertion was weakened.
- **Route audit: 222/222 clean.** Each row was checked for horizontal overflow, console errors,
  visible targets <44×44, inputs <16px and tab-bar visibility vs. expectation.
  - Matrix: 19 routes × 3 devices × light/dark × {new learner, returning learner with seeded localStorage}.
    The `/results` route only runs with seeded data.
  - Allowlist: inline text links in running text, and a checkbox inside a ≥44px label.

  | Route | iPhone 15 | iPhone SE | 15 Pro Max | light | dark | tab bar |
  |---|---|---|---|---|---|---|
  | `/`, `/study`, `/study/<topic>`, signs catalog | ✓ | ✓ | ✓ | ✓ | ✓ | shown |
  | `/study/תמרורים?view=drill` | ✓ | ✓ | ✓ | ✓ | ✓ | hidden |
  | `/flashcards/בטיחות` (deck) | ✓ | ✓ | ✓ | ✓ | ✓ | hidden |
  | `/exam`, `/flashcards`, `/review` (3 tabs), `/progress`, `/daily`, `/daily/history`, `/settings`, `/q/0693`, `/results/<id>`, print, 404 | ✓ | ✓ | ✓ | ✓ | ✓ | shown |
  | running exam (flow) | ✓ | ✓ | ✓ | ✓ | ✓ | hidden |

- **Flows: all pass** on iPhone 15 light, iPhone 15 dark, iPhone SE light and 15 Pro Max dark.
  - Home "המשך תרגול" is above the fold: bottom edge at 295px, fold 664px. It resumes at question 48, answer, next → 49.
  - Exam: answer 3, mark Q4, jump to Q2 via the strip, הגשה opens a bottom sheet, results.
  - Flashcards: flip and rate 3 cards.
  - Search: "תמרור" returns 12 results; opening one navigates; the input is 16px.
  - Review: all three tabs. Settings: reached from the header gear, theme toggled.
  - No page or console errors.
- **Production smoke at 390×844** (WebKit, light and dark): home (new tab bar), drill answer and
  action bar, exam start with timer, flashcard flip and rating bar, progress. No overflow and no
  errors. Manifest and icons are served.
- **Desktop parity (1280×800, Chromium, before = production pre-merge, after = local):**
  home, drill, progress, exam and review are visually identical. Two 1–4px drifts found in review
  (answer-row line-height, logo padding) were fixed. The only intentional desktop deltas are the
  bookmark star (lucide `Star` instead of ☆/★ text), the 16px desktop search input (needed for iPad
  Safari too) and the darker success/error text tokens.
- **Bundle:** home first-load JS gz 243,287 → 244,182 B (**+0.9 KB**, budget 5 KB). Settings
  243,942 → 203,663 B (−40 KB, drawer removed). An exact "shared chunks" baseline couldn't be built:
  Turbopack rejects a junctioned node_modules in a scratch worktree. These per-page numbers come
  from the same script before and after.

## 4. Screenshot index (`analysis/screenshots/iphone-2026-10-30/`)

Committed (curated):
- Flows (`flow-*`): `home`, `drill-answered`, `exam`, `exam-confirm`, `results`, `flashcards-flipped`,
  `search`. Each is captured on `iPhone15-light`, `iPhone15-dark`, `iPhoneSE-light` and `iPhone15ProMax-dark`.
- Production (`prod-*`): `home`, `drill`, `exam`, `flashcards`, `progress`, in light and dark.
- Routes: `home-iPhone15-light-new`, `home-iPhone15-dark`, `home-iPhoneSE-light`,
  `home-iPhone15ProMax-dark`, `progress-iPhone15-{light,dark}`, `review-iPhone15-light`,
  `settings-iPhone15-dark`, `drill-iPhoneSE-dark`, `flashcards-deck-iPhone15-light`.
- `audit.json`: every row of the 222-row matrix with its file name and issues (all empty).

The full 222-shot matrix is in `matrix/` (gitignored, 26 MB, regenerable with the audit script).

## 5. Deviations from the design, and why

1. **Readiness wording.** The artboards say "מוכנות למבחן 72%". The app shows **"סיכוי לעבור"**
   (the real pass-chance estimate) and "ציון משוער X/30". There is no separate "readiness %"
   metric, so this avoids inventing one.
2. **Tiles appear only with real data.** The pass-chance tile appears after 30 answers; before that,
   "שאלות שענית". The "due today" tile appears only when reviewed SRS cards are due. New learners
   see no tiles.
3. **Daily challenge copy** is the real deck, "3 שאלות · כדקה", not the artboard's "5 שאלות".
4. **Flashcard hints** are computed from the card's SM-2 state. A new card gives "מחר" for every
   grade, not the mock's "שוב היום / בעוד יום / בעוד 4 ימים". The mock's "החלק לדילוג" hint was
   dropped because flashcards have no swipe.
5. **Segmented controls** use 44px pills (52px track) instead of the artboard's 36px pills, to keep
   every target ≥44px.
6. **Settings gear** is in the global phone header on every browse screen (≤1 tap), rather than only
   on /progress.
7. **Exam answer rows** on phones show radio dots without the א/ב/ג letters, as in the Exam artboard.
   Drill rows keep the letters, in muted color.
8. **App icon ת** renders in satori's default font (regular weight). Heebo 800 isn't available to
   `ImageResponse` without bundling a font file.
9. **Progress page title** stays as the shared SectionHead ("התקדמות / לאן ללכת מכאן"); the
   artboard puts "התקדמות" in the header bar.

## 6. Self-review (simplify) outcome

Fixed:
- Dead `data-focus` effect removed; the focus marker now lives in FocusHeader, and FocusMode is deleted.
- SRS: one read per card for the rating hints; shared `NEW_CARD`; `countReviewedDue` replaces 2 inline copies.
- `formatChance` moved to `lib/readiness`; `ResumeTarget.meta` replaces parsing a display string.
- `WEAK_ACCURACY` constant; results page uses `BookmarkButton`; shared `goBack()`; HomeToday buttons build on `focusBase`.
- Root `scroll-padding` instead of a per-element scroll margin; flashcard min-height without `!important`.
- FocusActionBar reserves its own space above the tab bar; unused prop and class removed.
- Default prefetching on the tabs; the results IntersectionObserver only runs on phones.

Skipped, with the reason:
- A `th-tap` utility to replace ~25 `min-h-11 sm:min-h-0` call sites: broad churn, consistent today.
- Moving FocusHeader out of the page gutter (dropping `bleed`): would restructure PageShell.
- Extracting an `ExamTimer` child to avoid per-second runner re-renders: pre-existing pattern, no visible jank.
- De-duplicating the NavBar result rows, the hand-rolled progress bars and the icon-button bases.
- A bookmark `useSyncExternalStore` store, and caching `useReturningState` across its two home instances.

## 7. Known issues and next steps (for the 11:00 review)

- **Real-device pass.** All testing is WebKit emulation. A real iPhone in Chrome (toolbar
  collapse, Add to Home Screen standalone launch, bottom address-bar mode) still needs eyes.
- **Exam start CTA** ("התחל מבחן") sits just below the fold on iPhone SE. Consider moving it into an
  action bar above the tab bar.
- **Results page** keeps the PageShell back button on phones. Back from results goes to `/exam`.
- **Pre-existing copy:** "סימנת 1 שאלות" (plural with 1) in the submit confirm.
- The self-review items skipped in §6 are good follow-ups, especially the `th-tap` utility and `ExamTimer`.
- The preview server could not be started through the app's preview tool (declined in the unattended
  session), so `next start` ran from the shell.
