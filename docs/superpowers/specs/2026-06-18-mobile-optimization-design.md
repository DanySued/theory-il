# Mobile Optimization & Instant Navigation — Design

**Date:** 2026-06-18
**Status:** Approved (modal layer = optional phase)
**Stack:** Next.js 16.2.6 (App Router) · React 19.2.4 · Tailwind v4 · motion · RTL Hebrew

## Goal

Make the app feel **instant, smooth, and bug-free on a phone over mobile internet**. The
guiding constraint: a data-conscious user on cellular should rarely pay a full network cost
when moving between screens. Priorities, in order:

1. Fast interactiveness (hydration, time-to-interactive)
2. Working micro-interactions (no jank)
3. Fast page-to-page navigation (prefetched, shell reused, minimal data)
4. Zero bugs — verified, not assumed.

## Core insight (the architecture this is built on)

In the App Router, a `<Link>` navigation is a **client-side transition**, not a page reload:
the shell (NavBar, fonts, CSS, React runtime) stays mounted and is never re-downloaded;
linked routes are **prefetched** before the tap; **static** routes are prefetched in full;
visited routes are served from the client Router Cache. So a "transit" should cost a few KB
that already arrived — not a fresh full load.

The current app defeats this in three ways, which are the real targets:

1. **`NavBar` (a client component in the root layout) statically imports `questions.json`
   (~400KB minified, 1,273 questions).** This ships, parses, and hydrates on *every* page.
2. **`study/[topic]` and `flashcards/[topic]` are dynamic** → prefetch is skipped → the user
   pays at tap-time.
3. **`saved` / `mistakes` / `review`** each load and scan the full corpus separately.

## Architecture decision

**Load-once shared data layer + static multi-route "SPA-feel".**

- The question corpus loads **once**, is cached client-side, and every feature reads from that
  single cache — never re-downloaded across transits.
- `[topic]` routes become **static** via `generateStaticParams` → fully prefetched → instant.
- The route tree stays intact (organized, code-split, deep-linkable); it merely *behaves* like
  one SPA because the shell + data persist.

We keep routes as the organizational + code-splitting unit. We reduce **friction**, not routes.

## Scope — phased

### Phase 1 — Data layer & bundle (the biggest win)

- **1.1 Evict the corpus from the global bundle.** `NavBar` must not statically import
  `questions.json`. The corpus loads via dynamic `import()` only when the user opens search,
  then is cached. Net effect: every page navigation downloads/parses/hydrates dramatically
  less JS.
- **1.2 Shared corpus accessor.** A single module (e.g. `lib/data/corpus.ts`) exposes a
  lazy, memoized `loadCorpus()` so `saved`/`mistakes`/`review`/search all share one in-memory
  copy instead of importing the JSON independently.
- **1.3 Search work guard.** Debounce keystroke search and cap result scanning so a slow phone
  main thread can't jank while typing.

**Acceptance:** the shared client chunk no longer contains the question corpus (verified via
build output / bundle inspection); search still works; typing stays smooth.

### Phase 2 — Static routes & prefetch correctness

- **2.1 `generateStaticParams`** for `study/[topic]` and `flashcards/[topic]` from the known
  finite topic list (`lib/constants` / topic source). Confirm they render statically.
- **2.2 Navigation audit.** Every in-app navigation uses `<Link>` (prefetched). Programmatic
  `router.push` is acceptable for post-action redirects only.
- **2.3 `loading.tsx` coverage** confirmed on all dynamic routes (most already present).

**Acceptance:** `[topic]` routes show as static in the build manifest; no nav uses a raw
`<a>` for internal routes; navigating to a topic from `/study` is instant.

### Phase 3 — Revision hub (reduce real transit)

- **3.1** Merge `saved` / `mistakes` / `review` into one `/review` hub with **in-page tabs**.
  Switching tabs is pure client state — **zero network**.
- **3.2** Tabs are deep-linkable via `?tab=saved|mistakes|hard` synced with
  `history.pushState` (per Next "Native History API" guidance) so back/forward and direct
  load work.
- **3.3** Old routes `/saved`, `/mistakes`, `/review` redirect into the hub
  (`/review?tab=…`). NavBar + any internal links updated.

**Acceptance:** all three surfaces reachable from one hub with no full navigation between
them; deep links and back button work; old URLs redirect; corpus loaded once for all tabs.

### Phase 4 — Mobile shell & motion

- **4.1 Hamburger drawer nav** for `<sm`: top bar shows logo · streak · search · ☰; tapping ☰
  opens a right-side (RTL-correct) slide-in drawer with the links stacked (≥44px targets),
  active link highlighted. Closes on link tap / backdrop / Escape / route change; body scroll
  locks while open; animated with `motion`. Desktop nav unchanged at `sm+`.
- **4.2 Viewport & safe-area.** Add a Next `viewport` export
  (`width=device-width, initialScale=1, viewportFit=cover`) + `theme-color`; apply
  `env(safe-area-inset-*)` padding to the sticky header and drawer.
- **4.3 View Transitions** (`experimental.viewTransition` + React `<ViewTransition>`):
  directional slides for forward/back, anchored (non-animating) header, optional
  shared-element morph where it reads well. Must respect `prefers-reduced-motion` (zero
  duration). Without browser support the app works normally, just un-animated.
- **4.4 Touch polish.** Hide the desktop-only keyboard hint in `QuestionCard` on mobile
  (`hidden sm:block`).

**Acceptance:** on a 390px viewport the nav is a working drawer; content clears notch/home
indicator; transitions are smooth and reduced-motion-safe; no desktop-only UI shown on touch.

### Phase 5 (OPTIONAL) — Intercepting-route modal for `q/[id]`

Deferred by decision. Opening a question from search/lists shows an **intercepting-route
modal** overlay (real URL, works on refresh/direct-load, preserves the underlying list).
Added only after Phases 1–4 are proven bug-free, as its own isolated change, because
modal-over-route + refresh + back-button + RTL focus-trap is the richest bug surface.

## Correctness gate (applies to every phase)

1. `npm run build` passes clean.
2. `npm run lint` passes clean.
3. `npx tsc --noEmit` passes clean.
4. **Playwright** click-through at 390px mobile viewport across every route
   (home → study → a topic drill → exam → flashcards → a topic deck → review (all tabs) →
   progress → glossary → signs → daily → daily/history → settings): no console errors, no
   horizontal overflow, drawer opens/closes, search opens and finds results, a question can
   be answered and revealed.
5. After all phases land: `/code-review ultra` on the branch diff.

## Out of scope

PWA/offline, native wrapper, per-page visual redesigns, auth, backend changes.

## Risk notes

- View Transitions is `experimental` — gate behind config; verify it degrades gracefully.
- Dynamic `import()` of the corpus must handle the in-flight state (don't fire search against
  an unloaded corpus; show the existing search affordance until ready).
- The `/review` consolidation changes URLs — redirects must be in place before NavBar links
  change, to avoid dead links.
