# Theming Completion & Quality/Perf Hardening — Implementation Plan

> **STATUS (2026-10-30): COMPLETE.** Done interactively rather than by the overnight loop.
> Notes: Task 2 found the UI already tokenized except `text-white` on accent/error fills, now
> `--th-on-accent` / `--th-on-error` (white on the dark-mode accent was ~2.6:1). Task 5: the drawer
> was already accessible; the exam dialogs were not and now use `components/ConfirmDialog.tsx`.
> Task 7 found the corpus eagerly loaded on `/`, `/exam`, `/daily*` — fixed. Task 8 is
> `npm run check` + `npm run build` + `npm run test:e2e`.

> **For the overnight loop:** This is the **Phase A** plan. Execute task-by-task with
> `superpowers:subagent-driven-development`. Each task is atomic and independently
> committable (REQUIRED — the auto-push Stop hook ships every iteration). Tick the
> checkbox when the task's gate passes and it is committed. One task per iteration is fine.

**Goal:** Finish the light/dark theme system the in-flight work started (toggle shipped, full
dark token set exists) and harden quality/perf — so every route looks right in both themes,
uses tokens not hardcoded colors, is accessible in RTL, and degrades gracefully.

**Tech stack:** Next.js 16.2.6 (App Router) · React 19.2.4 · Tailwind v4 · motion · TypeScript ·
RTL Hebrew · localStorage only, no auth · 1,273-question corpus (must stay out of shared chunk).

## Global constraints
- Next.js 16.2.6 — read `node_modules/next/dist/docs/` before an unfamiliar API (AGENTS.md).
- RTL: `dir="rtl"`; `justify-start` = RIGHT, `justify-end` = LEFT.
- Use `--th-*` tokens; never hardcode UI colors. Legit exceptions: OG/canvas (`app/icon.tsx`,
  `components/ShareCard.tsx`) and print (`app/study/[topic]/print/PrintView.tsx`) — leave those.
- Theme contract: no `data-theme` attr → follow OS; `data-theme="dark"|"light"` → forced.
  Tokens live in `app/globals.css` (`:root`, `@media (prefers-color-scheme: dark)`,
  `:root[data-theme="dark"]`). Keep the media-query and explicit-dark blocks identical.
- Per-task gate: `npx tsc --noEmit` must pass. Heavier tasks also run `npm run build` + `npm run lint`.
- Auto-push Stop hook commits/pushes each turn → deploys to production Vercel. Each task ends green.

---

## Task 1: Surface theme control in Settings
**Files:** `app/settings/SettingsClient.tsx` (+ reuse `components/ThemeToggle.tsx` logic)

The toggle currently lives only in the NavBar (icon-only). Settings should expose an explicit
**light / dark / system** choice (three-state), persisting to the same `theory-il:theme` key,
and clearing the key for "system" (so CSS falls back to the OS media query).

- [x] Add a labeled segmented control (3 options, ≥44px targets, RTL labels: בהיר / כהה / מערכת)
      in a Settings row. Reads current state from `localStorage`/`data-theme`; on change sets or
      removes the key and updates `document.documentElement.dataset.theme`.
- [x] Extract the shared read/write logic so ThemeToggle and Settings don't duplicate it
      (e.g. `lib/theme.ts` with `getTheme()/setTheme(t: "light"|"dark"|"system")`). ThemeToggle
      becomes a thin consumer.
- [x] Gate: `npx tsc --noEmit`. Commit: `feat(settings): light/dark/system theme control + shared lib/theme`

## Task 2: Hardcoded-color sweep
**Files:** the ~25 files flagged by `rg '#[0-9a-fA-F]{3,6}|rgba?\(|text-white|bg-white|bg-black|text-black|text-(gray|slate|zinc)-|bg-(gray|slate|zinc)-' app components`

Convert UI-facing hardcoded colors to `--th-*` tokens so dark mode is correct everywhere. Work
in small batches (a few files per iteration is fine — each batch is its own commit).

- [x] Audit each hit. Convert genuine UI colors to tokens (add a token to `globals.css` — in BOTH
      dark blocks — if none fits). **Leave** OG/canvas (`app/icon.tsx`, `ShareCard.tsx`) and
      `PrintView.tsx` (print is intentionally light) — annotate why with a one-line comment.
- [x] `text-white` on accent buttons is fine (accent is dark enough in both themes) — verify
      contrast, keep if AA-passing.
- [x] Gate per batch: `npx tsc --noEmit`. Commit: `refactor(theme): tokenize hardcoded colors in <area>`

## Task 3: Dark-mode visual audit (Playwright, both themes)
**Files:** screenshots → `analysis/screenshots/theme-*`; fixes across components as found.

- [x] Start dev server (background), drive Playwright across every route in BOTH themes
      (force via `localStorage.setItem('theory-il:theme', …)` + reload): `/`, `/study`,
      `/study/[topic]` (drill), `/exam`, `/flashcards`, `/flashcards/[topic]`, `/review`
      (all 3 tabs), `/progress`, `/daily`, `/daily/history`, `/settings`, `/results/[id]`,
      signs catalog. Screenshot each in light + dark.
- [x] Log contrast/legibility/invisible-border issues into `analysis/backpocket.md` under
      "Theme findings", then fix the clear ones inline (token tweaks). Defer subjective ones.
- [x] Gate: `npx tsc --noEmit` + visual confirm. Commit: `fix(theme): dark-mode contrast fixes from visual audit`

## Task 4: Dead-code & route hygiene
**Files:** repo-wide.

- [x] Confirm `/glossary` fully retired: `rg -i "glossary|/glossary" app components lib` — remove
      any dangling links/imports (ignore `analysis/` + `docs/` historical mentions).
- [x] Remove unused imports/exports/files surfaced by `npm run lint` and `npx tsc --noEmit`.
- [x] Gate: `npm run lint` + `npx tsc --noEmit` clean. Commit: `chore: remove dead glossary refs + unused code`

## Task 5: Accessibility pass (RTL + interactive controls)
**Files:** `components/MobileDrawer.tsx`, `components/ThemeToggle.tsx`, `app/review/ReviewHub.tsx`,
`components/QuestionCard.tsx`, others as found.

- [x] Verify interactive controls have accessible names (`aria-label` in Hebrew), correct roles
      (`role="tablist"/"tab"` with `aria-selected` on ReviewHub — already present, verify), and
      focus-visible rings (globals already defines `:focus-visible`).
- [x] Drawer: focus trap while open, restore focus to trigger on close, `aria-expanded` on trigger,
      `aria-modal` + labelled dialog. Escape closes (verify).
- [x] Gate: `npx tsc --noEmit` + Playwright keyboard pass (Tab/Escape) on drawer + tabs.
      Commit: `a11y: accessible names, focus trap, keyboard nav for drawer/tabs/toggle`

## Task 6: Error boundaries & resilience
**Files:** create `app/error.tsx`, `app/global-error.tsx`; per-route `error.tsx` where a client
component can throw (e.g. `app/results/[id]/`).

- [x] Add a root `app/error.tsx` (client) with an RTL, tokenized fallback + reset button, and
      `app/global-error.tsx`. Match PageShell width/spacing.
- [x] Gate: `npm run build` (boundaries must not break SSG). Commit: `feat(resilience): error boundaries (root + results)`

## Task 7: Perf guard
**Files:** verify-only unless a regression is found.

- [x] `npm run build`; confirm `study/[topic]` + `flashcards/[topic]` are static (●), and the
      ~400KB corpus is NOT in the shared chunk (grep a known question-id substring in
      `.next/static/chunks` — expect only route/data chunks). Note finding in commit body.
- [x] If Lighthouse tooling is available, capture mobile scores for `/`; else skip and note.
- [x] Gate: `npm run build`. Commit (only if changes): `perf: keep corpus out of shared chunk / static routes`

## Task 8: Phase-A correctness gate
**Files:** none (verification — last Phase-A task).

- [x] `npx tsc --noEmit` PASS · `npm run lint` PASS · `npm run build` PASS.
- [x] Playwright @390×844 across all routes in BOTH themes: no `console.error`, no horizontal
      scroll (`scrollWidth <= innerWidth + 1`), page rendered; open drawer + navigate; toggle theme.
- [x] Record results in commit body. Any failure → fix and re-run from Task 8 Step 1.
- [x] On green, Phase A is COMPLETE — the orchestrator switches to Phase B (backpocket).

---

## Self-review
- **Coverage:** theming = Tasks 1–3,7; hardening = Tasks 4–7; gate = Task 8. Both focus areas covered.
- **Atomicity:** every task ends in its own commit with a passing gate — safe for auto-push.
- **No placeholders:** exceptions (OG/canvas/print) explicitly named; verify-only tasks marked so.
