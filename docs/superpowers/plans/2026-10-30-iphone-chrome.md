# iPhone × Chrome adaptation: implementation plan

**Date:** 2026-10-30 · **Owner:** Dany · **Executor:** autonomous run (19:30 routine)
**Design (source of truth):** Claude Design canvas "Theory-IL iPhone Redesign":
https://claude.ai/artifact/LdNb3bURyAGNgBBG4XWnu1. Offline copies of every artboard are in
`docs/design/iphone-chrome/*.dc.html`: Main = Home, Drill, Exam (dark), Flashcards, Progress.
Open these files and match their spacing, sizes, copy and hierarchy.

**Stack:** Next.js 16.2.6 App Router · React 19.2 · Tailwind v4 · motion · RTL Hebrew (`dir="rtl"`).
Per AGENTS.md this is not the Next.js from training data. Read `node_modules/next/dist/docs/`
before you touch metadata, the manifest, icons or the viewport.

---

## 1. Product framing (PM)

**Primary user:** an Israeli learner-driver aged 16–18 studying on their own iPhone in **Chrome
for iOS**. They study in short sessions (bus, break, bed), one-handed, often over cellular,
often in dark mode at night.

**Jobs to be done:**
1. Continue where I stopped in one tap.
2. Answer questions quickly with my thumb and get clear right/wrong feedback.
3. Take a realistic timed exam without fighting the UI.
4. See whether I'm ready for the real test.

**Success criteria (measurable, verified in §6):**
- Every route at 375, 390 and 430px wide: no horizontal overflow and 0 console errors.
- Every interactive target ≥44×44px; answer rows ≥56px tall.
- Primary actions (next, reveal, rate, submit) sit in a bottom bar inside the thumb zone.
- No iOS input zoom: every input's font-size is ≥16px.
- The home screen shows a "continue" action above the fold at 390×664 (the Chrome-iOS visible
  viewport with both toolbars showing).
- Desktop (≥640px) looks the same as today, apart from shared token fixes.

**Non-goals:** auth, backend, new paid APIs (BP-02 explanations stays GATED), a native app,
redesigning desktop, new npm dependencies (lucide-react and motion are already installed).

## 2. Platform facts: Chrome on iOS (fullstack)

- Chrome on iOS runs on **WebKit**, so Safari rules apply. Test with WebKit, not Chromium.
- The address bar can be at the top or the bottom, and both toolbars collapse on scroll. The
  visible viewport changes between about 664 and 844px tall on a 390px-wide iPhone. Use `dvh`/`svh`, never
  `100vh`. Fixed bottom bars use `padding-bottom: env(safe-area-inset-bottom)`. Never size them
  with vh.
- `viewportFit: "cover"` is already set in `app/layout.tsx`. Keep it.
- An input with font-size under 16px zooms the page on focus. The NavBar search is `text-sm`
  today, which is a bug.
- `:hover` sticks after a tap. Tailwind v4 `hover:` is already gated to `(hover:hover)`, but the
  custom `.th-card-hover:hover` in `globals.css` is not. Gate it too.
- Add to Home Screen exists in Chrome iOS (share menu) and opens the app standalone. Ship a
  web manifest and an apple-touch-icon.
- `mousedown` outside-click handlers behave badly on touch. Use `pointerdown`.

## 3. Audit of production today (2026-10-30, 390×844, theory-il.vercel.app)

| # | Finding | Where |
|---|---------|-------|
| A1 | The drill question card overflows the left edge of the viewport. The card is shifted and clipped. | `/study/[topic]?view=drill` → `QuestionCard` / `DrillClient` |
| A2 | Prev/next buttons sit below the fold, so the user scrolls after every answer. | `QuestionCard` nav row |
| A3 | Header icon buttons are 36px (`w-9 h-9`), under 44px. | `NavBar`, `MobileDrawer`, `ThemeToggle` |
| A4 | Navigation is hidden behind a hamburger. Core sections are 2 taps away. | `MobileDrawer` |
| A5 | The home hero fills the whole first screen (`min-h-[calc(100dvh-61px)]`). No progress or "continue" above the fold. | `app/page.tsx` |
| A6 | No web manifest and no apple-touch-icon. The icon is a black ת that doesn't match the brand. | `app/` |
| A7 | The search input is `text-sm`, which zooms on iOS. The mobile search is an absolutely positioned bar, not a full sheet. | `NavBar` |
| A8 | Answer buttons are `text-sm py-3`. They're small for thumbs and long Hebrew answers wrap tightly. | `QuestionCard`, `ExamRunner` |
| A9 | Focus screens (drill, exam, flashcards) still show the full site header, big page title and back button, which costs about 200px of vertical space. | `PageShell`, `DrillClient`, `ExamRunner` |

Re-verify each finding before you fix it. Fix the root cause, not the symptom. For A1,
inspect computed widths: the likely suspects are motion `drag="x"`, the enter variant's `x`
offset, and `w-full max-w-2xl` inside a flex `items-center` parent without `min-w-0`.

## 4. Design system additions (UI/UX)

Keep the existing `--th-*` tokens in `app/globals.css`. Add:

```css
:root {
  --th-tabbar-h: 56px;                       /* bar height excluding safe area */
  --th-actionbar-h: 72px;                    /* 52px button + 10px+10px padding */
  --th-safe-b: env(safe-area-inset-bottom, 0px);
  --th-safe-t: env(safe-area-inset-top, 0px);
  --th-tap: 44px;                            /* minimum target */
}
@media (max-width: 639px) { :root { --th-page-px: 1rem; --th-page-py: 1.25rem; --th-page-gap: 1.25rem; } }
html { -webkit-text-size-adjust: 100%; }
body { -webkit-tap-highlight-color: transparent; overscroll-behavior-x: none; }
button, a, [role="button"] { touch-action: manipulation; }
```

Patterns from the canvas:
- **Browse screens** (home, study index, flashcards index, review, progress, daily, settings,
  results): the global header is 56px tall with the logo, streak pill, and search and settings as
  44px icon buttons. A **bottom tab bar** with 5 tabs, right to left: בית, לימוד, מבחן, חזרה,
  התקדמות. Each tab shows a 24px icon and an 11px label. Active = accent color, weight 700,
  `aria-current="page"`.
  Tab active rules: בית=`/`; לימוד=`/study*`, `/flashcards*`; מבחן=`/exam*`, `/results*`;
  חזרה=`/review*`, `/daily*`; התקדמות=`/progress*`, `/settings`.
- **Focus screens** (drill, a running exam, a flashcard deck): no tab bar and no global header on
  mobile. A **FocusHeader** takes their place: 44px back/close button, title, subtitle line,
  an optional trailing 44px action, and a 3px progress line under it. A **FocusActionBar** is
  fixed at the bottom with the primary button (52px tall, radius 14, accent) and secondary
  buttons (52px, outlined).
- Cards: radius 20px, 16px padding, 1px `--th-border`. Answer rows: min-height 56px, 16px text,
  radius 14px. Correct = 2px success border + success-soft fill + check icon. Wrong = error
  equivalents. Selected (exam, ungraded) = 2px accent border + accent-soft fill + filled radio dot.
- Segmented control (לימוד | תרגול, review tabs): full width, 44px track, white pill on
  `--th-muted-bg`.
- Use lucide icons, matched to the canvas: Home, BookOpen, Timer, RotateCcw, BarChart3, Search,
  Flame, Star, ChevronRight (back in RTL), ChevronLeft (forward in RTL), X, Flag, Settings,
  Check. No emoji in UI chrome. NavStreakBadge currently uses 🔥; switch it to the Flame icon.
- Dark mode must look as good as light. The Exam artboard is the dark reference.

## 5. Work plan (execute in order, one commit per step, on branch `feat/iphone-chrome`)

### Step 0: Setup and integrating PR #2 (decided by Dany 2026-10-30)
- PR DanySued/theory-il#2 ("Learner experience, performance and test coverage overhaul", branch
  `claude/bold-ritchie-3np7hn`) overlaps heavily with this plan: home hero, QuestionCard,
  ExamRunner, Progress, ThemeToggle, ConfirmDialog, explanations and tests. **Merge it first.**
  1. `git fetch origin`. Check that PR #2 is still open, `MERGEABLE`, and its Vercel check is
     green (`gh pr view 2 --json state,mergeable,statusCheckRollup`).
  2. Merge it on GitHub with `gh pr merge 2 --merge` (a merge commit, not squash). Wait for the
     production deployment of the new master to go green, then smoke-test theory-il.vercel.app.
  3. Bring local master up to date: `git checkout master && git pull --no-rebase origin master`.
     Local master had 1 unpushed commit (a955139, housekeeping). Keep it, resolve any conflicts
     (PR #2 also archived docs and removed stray files; prefer PR #2's version when they clash),
     run tsc, lint, build and `npm test` if it exists, then push master.
  4. If PR #2 can't merge (conflicts it can't resolve, or red checks it can't fix in ~30 min),
     build on top of its branch instead. Open the redesign as a PR stacked on #2, do NOT merge
     either one, and say so in the report.
- Then `git checkout -b feat/iphone-chrome` from the updated `master`.
- Reuse what PR #2 adds instead of duplicating it: `ReadinessCard` (honest readiness estimate),
  `ReturningHero` (it replaces the deleted `ContinueTile`, so the Home "continue" card builds on
  it), `ConfirmDialog` (restyle it as a mobile bottom sheet), `Explanation`, and
  `PreferencesSection` (the theme toggle lives there). The unit and e2e tests must keep passing:
  update them when a markup change breaks a selector, but never weaken an assertion.
- Baseline: `npm ci` if node_modules is stale, then `npx tsc --noEmit`, `npm run lint`,
  `npm run build`. Record the results.
- Read the 5 artboards in `docs/design/iphone-chrome/` and the Next docs on `manifest`,
  `apple-icon` and `viewport`/`metadata`.

### Step 1: Foundations (`globals.css`, `layout.tsx`, icons, manifest)
- Add the tokens and base rules from §4. Gate `.th-card-hover:hover` behind `@media (hover:hover)`.
- `app/manifest.ts`: name "תיאוריה — לימוד לבחינה העיונית", short_name "תיאוריה", `dir: "rtl"`,
  `lang: "he"`, `display: "standalone"`, `start_url: "/"`, background `#f6f4ee`, theme
  `#1d4ed8`, icons 192/512 (generate them with `ImageResponse` route files, or static PNGs
  produced at build time; follow the Next docs).
- `app/apple-icon.tsx`: 180×180, accent `#1d4ed8` background, white ת, weight 800. Restyle
  `app/icon.tsx` the same way so the brand is consistent.
- `metadata.appleWebApp = { capable: true, title: "תיאוריה", statusBarStyle: "default" }` and
  `formatDetection: { telephone: false }`.
- Grep for `100vh`, `h-screen`, `min-h-screen` and `calc(100dvh`, and fix each for mobile.

### Step 2: Navigation shell
- New `components/BottomTabBar.tsx` (client): `sm:hidden`, `position: fixed; inset-inline: 0;
  bottom: 0`, `padding-bottom: var(--th-safe-b)`, a translucent card background with
  `backdrop-blur`, and a top border. Use `<Link prefetch>` for each tab. Render it in
  `app/layout.tsx`.
- Focus mode: new `components/FocusMode.tsx`. It sets `document.documentElement.dataset.focus = "1"`
  on mount and removes it on unmount. CSS: at `max-width: 639px`, `[data-focus] .th-tabbar` and
  `[data-focus] .th-site-header` get `display: none`. Browse pages need bottom padding so content
  clears the tab bar: `body:not([data-focus]) main { padding-bottom: calc(var(--th-tabbar-h) + var(--th-safe-b) + 1rem) }`
  under 640px. Pick the selector that works with the actual tree, and verify the last element
  of every page is reachable.
- `NavBar` mobile: remove the hamburger and `MobileDrawer`. Delete the file if nothing imports
  it. Keep logo, NavStreakBadge (Flame icon) and Search, with 44px targets. ThemeToggle moves to
  Settings on mobile (keep it in the desktop nav). Add a settings gear link to the mobile header
  on `/progress`, following the Progress artboard, or keep it in the header globally. Choose
  whichever is cleaner, but Settings must stay reachable in ≤2 taps.
- Mobile search becomes a full-screen sheet: a fixed overlay with an input at the top
  (`text-base`, 16px), 48px result rows, close button 44px, body scroll locked. Switch the
  outside-click handler to `pointerdown`.
- Desktop (≥640px) nav stays visually unchanged.

### Step 3: Focus screens
- `components/FocusHeader.tsx` and `components/FocusActionBar.tsx`, shared by all three focus
  screens. Both are mobile-only via `sm:hidden`. Desktop keeps the existing layout.
- **Drill** (`app/study/[topic]/DrillClient.tsx`, `components/QuestionCard.tsx`): follow the
  Drill artboard. Fix A1 at its root. Make the card full width. Use a full-width segmented
  control. Answer rows follow §4. The sign image is centered at max-h-40.
  - FocusActionBar before answering: [prev icon 56px] [secondary "הצג תשובה", flex-1] [next icon 56px].
    After answering: [prev icon 56px] [primary "השאלה הבאה", flex-1].
  - Feedback strip under the answers: "נכון!" or "לא נכון", plus `explanation` when it exists.
    Never invent explanation text. On reveal, call `scrollIntoView({block:"nearest"})` on the
    strip.
  - Bookmark star lives in FocusHeader as the trailing action. Keep swipe left/right to navigate,
    but it must not cause horizontal overflow. Clip with `overflow-x: clip` on a wrapper.
- **Exam** (`components/ExamRunner.tsx`): follow the Exam artboard.
  - FocusHeader variant: X (exit, keeps the existing confirm), centered timer pill
    (`tabular-nums`, `dir="ltr"`, turns error-colored under 5 minutes), "הגשה" outlined button.
  - Status row "שאלה N מתוך 30" plus "X נענו · Y מסומנות". Below it, a horizontally scrollable
    question-map strip with 44px chips in 4 states (answered, current ring, marked amber,
    empty). It uses scroll-snap and scrolls the current chip into view on change.
  - Answers are radio rows (`role="radio"`, `aria-checked`).
  - Bottom bar: [prev icon] [סמן flag toggle, amber when on] [primary "הבאה"]. On the last
    question the primary button becomes "הגשה" and opens the existing confirm.
  - Confirm dialogs render as bottom sheets on mobile with buttons ≥48px.
- **Flashcards** (`components/FlashcardRunner.tsx`): follow the Flashcards artboard. The card
  fills the remaining height. Tap to flip, and keep the existing flip animation. The rating bar
  has 3 buttons, 56px tall: לא ידעתי / בערך / ידעתי (grades 1/3/5, unchanged). Show
  next-interval hints only if they can be computed from the real SRS state, otherwise no hint.

### Step 4: Browse screens
- **Home** (`app/page.tsx`), following the Main artboard. Below 640px:
  - The hero becomes compact: eyebrow + h1 at 30px. No full-screen min-height.
  - Primary card: if there is a last session (`lib/lastSession.ts` / `ContinueTile`), show
    "המשך מאיפה שעצרת" with topic, position, progress bar and a 52px "המשך תרגול" button.
    Otherwise show "בוא נתחיל בתמרורים" → `/study/תמרורים?view=drill`.
  - Two stat tiles (exam readiness %, cards due today) only when real data exists. Never show
    fake numbers. For new users, hide them or show an onboarding hint.
  - DailyChallengeTile as a 60px row, a 2×2 study-modes grid, then the existing topics and signs
    sections below.
  - At ≥640px keep today's desktop hero and layout.
- **Progress** (`app/progress/ProgressClient.tsx`), following the Progress artboard: readiness
  ring card, topic accuracy bars with the weakest highlighted in amber and a CTA to drill it,
  recent exam rows ≥52px with pass/fail chips. Add BP-04 (week-over-week delta) only if
  `listAttempts()` makes it trivial, and only with real data.
- **All other routes** (`/study`, `/flashcards`, `/review` tabs, `/daily`, `/daily/history`,
  `/settings`, `/results/[id]`, `/q/[id]`, `/study/[topic]/print`, the signs catalog): 16px
  gutters, 20px card radius, list rows ≥48px, segmented controls for tabs, no overflow, and every
  target ≥44px. `/results/[id]` gets a FocusActionBar with "מבחן חדש" and "חזרה על הטעויות" if
  those actions exist.

### Step 5: Polish and performance
- Motion: keep it subtle and keep `prefers-reduced-motion` support. Tab switches must not animate
  the tab bar. Check that view transitions don't flash the fixed bars. Extend the
  `::view-transition` rules in `globals.css` to anchor `.th-tabbar` the way `site-header` is
  anchored.
- Images get `loading="lazy" decoding="async"`, except the first question image.
- Bundle: the shared first-load JS must not grow by more than 5KB vs baseline. Check the
  `npm run build` output.
- Accessibility: contrast ≥4.5:1 in both themes, focus-visible rings on everything, and the tab
  bar is a `<nav aria-label="ניווט ראשי">`.

### Step 6: Verification (required, no shortcuts)
1. `npx tsc --noEmit`, `npm run lint` and `npm run build` are all clean, plus the unit and e2e
   test scripts from PR #2 (`npm test` and whatever package.json defines).
2. Device run with **WebKit** iPhone emulation. Use Playwright from a scratch directory
   (`npx -y playwright@latest install webkit`, then a script using `devices['iPhone 15']`,
   `devices['iPhone SE']` and `devices['iPhone 15 Pro Max']`) against `npm run start`. Do not add
   Playwright to package.json. If WebKit can't run on this machine, fall back to the Claude
   built-in browser with the mobile preset, and say so in the report.
3. For every route in light and dark: no horizontal overflow
   (`scrollWidth === clientWidth`), 0 console errors, and a script that lists visible
   interactive elements smaller than 44×44. Fix them all, with a small documented allowlist
   for inline text links.
4. Flows: home → continue → answer → next; full exam (answer a few, mark one, jump via the strip,
   submit) → results; flashcards (flip, rate 3 cards); search (open, type "תמרור", open a result);
   review tabs; settings theme toggle. Tab bar shows on browse routes and hides on focus routes.
5. Save screenshots to `analysis/screenshots/iphone-2026-10-30/` (route × device × theme), and
   compare them against the artboards.

### Step 7: Ship
- Commit each step on `feat/iphone-chrome` (conventional messages, `feat(mobile): …`).
- `git push -u origin feat/iphone-chrome`, which creates a Vercel preview. Check the status with
  `gh api repos/DanySued/theory-il/commits/<sha>/status`. If the preview build fails, read the
  logs, fix, and push again.
- When verification passes and the preview is green, merge into `master` with `--no-ff` and
  `git push origin master`. Vercel auto-deploys production.
- Smoke-test `https://theory-il.vercel.app` at 390×844: home, a drill answer, exam start,
  flashcards, progress. If production is broken and can't be fixed in this run, `git revert`
  the merge, push, and record it.
- Write `docs/superpowers/reports/2026-10-30-iphone-chrome-report.md`: what shipped (with
  commits), screenshots index, verification results, deviations from the design and why, and
  open issues for the 11:00 review.

## 6. Definition of done
All §1 success criteria pass in the Step 6 run. Production is green and serving the new mobile
UI. The report exists. Desktop is unchanged. No new dependencies. No gated items were run.
