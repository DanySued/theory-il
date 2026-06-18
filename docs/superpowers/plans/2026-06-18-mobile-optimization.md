# Mobile Optimization & Instant Navigation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the app feel instant, smooth, and bug-free on mobile by removing the ~400KB question corpus from every client navigation, consolidating revision surfaces, and adding a mobile drawer + smooth transitions.

**Architecture:** Keep the App-Router route tree (code-split, deep-linkable) but make it behave like an SPA: a load-once shared corpus accessor that client features share, statically-prerendered routes that prefetch fully, one `/review` hub with in-page tabs, and a mobile hamburger drawer with View Transitions.

**Tech Stack:** Next.js 16.2.6 (App Router), React 19.2.4, Tailwind v4, motion, TypeScript, RTL Hebrew. No unit-test runner exists; the per-task "test" cycle is `tsc --noEmit` + `next build`/`lint` + Playwright at 390px.

## Global Constraints

- Next.js 16.2.6 — read `node_modules/next/dist/docs/` before using an unfamiliar API (per AGENTS.md).
- RTL: `dir="rtl"`; `justify-start` aligns RIGHT, `justify-end` aligns LEFT. Drawer slides from the right.
- Use design tokens (`var(--th-*)`); never hardcode colors.
- All internal navigation uses `<Link>` (prefetch); `router.push` only for post-action redirects.
- The corpus (`lib/data/questions.json`, ~400KB, 1273 questions) must NOT appear in any shared/client chunk.
- Verification per task: `npx tsc --noEmit` must pass. Final gate: `next build` + `lint` clean, Playwright pass, then `/code-review ultra`.
- Auto-push Stop hook commits/pushes each turn; explicit commits still made per task.

---

## File Structure

- Create `lib/data/corpus.ts` — lazy, memoized client-side corpus loader (the linchpin).
- Modify `components/NavBar.tsx` — remove static corpus import; lazy-load on search open; add hamburger drawer.
- Create `components/MobileDrawer.tsx` — the slide-in nav drawer.
- Modify `app/saved/SavedClient.tsx`, `app/mistakes/MistakesClient.tsx`, `app/review/ReviewClient.tsx` — read from `corpus.ts`; become tab panels.
- Create `app/review/ReviewHub.tsx` + modify `app/review/page.tsx` — tabbed hub.
- Create `app/saved/page.tsx` & `app/mistakes/page.tsx` redirects (replace existing).
- Modify `app/layout.tsx` + `app/globals.css` — viewport/safe-area, view-transition CSS.
- Modify `next.config.ts` — `experimental.viewTransition`.
- Modify `components/QuestionCard.tsx` — hide keyboard hint on mobile.

---

## Task 1: Shared corpus accessor

**Files:**
- Create: `lib/data/corpus.ts`

**Interfaces:**
- Produces: `loadCorpus(): Promise<Question[]>` (memoized — resolves the same array instance on every call), `getCorpusSync(): Question[] | null` (returns cached array or null if not yet loaded).

- [ ] **Step 1: Create the accessor**

```ts
// lib/data/corpus.ts
import type { Question } from "@/components/QuestionCard";

let cache: Question[] | null = null;
let inflight: Promise<Question[]> | null = null;

/** Lazily load the full question corpus once, client-side, and reuse it. */
export function loadCorpus(): Promise<Question[]> {
  if (cache) return Promise.resolve(cache);
  if (!inflight) {
    inflight = import("@/lib/data/questions.json").then((m) => {
      cache = (m.default as Question[]);
      inflight = null;
      return cache;
    });
  }
  return inflight;
}

/** Synchronous peek — null until loadCorpus() has resolved at least once. */
export function getCorpusSync(): Question[] | null {
  return cache;
}
```

- [ ] **Step 2: Verify types**

Run: `npx tsc --noEmit`
Expected: PASS (no output).

- [ ] **Step 3: Commit**

```bash
git add lib/data/corpus.ts
git commit -m "feat: lazy memoized corpus accessor"
```

---

## Task 2: Evict corpus from NavBar (the biggest win)

**Files:**
- Modify: `components/NavBar.tsx`

**Interfaces:**
- Consumes: `loadCorpus`, `getCorpusSync` from Task 1.

- [ ] **Step 1: Remove the static import.** Delete `import questionsData from "@/lib/data/questions.json";` and `const allQuestions = questionsData as Question[];`.

- [ ] **Step 2: Lazy-load on search open.** Add corpus state and trigger load when the desktop input gains focus or the mobile search opens:

```tsx
const [corpus, setCorpus] = useState<Question[]>([]);
const ensureCorpus = useCallback(() => {
  if (corpus.length === 0) loadCorpus().then(setCorpus);
}, [corpus.length]);
```

Call `ensureCorpus()` in the input's `onFocus` and in the mobile search-open button's `onClick`. Replace `searchQuestions(allQuestions, ...)` with `searchQuestions(corpus, ...)`. Until the corpus resolves, `corpus` is `[]` so `questionMatches` is empty — page suggestions still work immediately.

- [ ] **Step 3: Verify corpus is gone from the client.**

Run: `npx tsc --noEmit && npm run build`
Expected: build succeeds. Confirm `.next` no longer bundles the corpus into the shared chunk — inspect `.next/static/chunks` (grep a known question id substring; expect it only in route/data chunks, not the shared framework/main chunk). Note finding in commit body.

- [ ] **Step 4: Commit**

```bash
git add components/NavBar.tsx
git commit -m "perf: lazy-load question corpus in NavBar (evict ~400KB from global bundle)"
```

---

## Task 3: Revision clients read from the corpus accessor

**Files:**
- Modify: `app/saved/SavedClient.tsx`, `app/mistakes/MistakesClient.tsx`, `app/review/ReviewClient.tsx`

**Interfaces:**
- Consumes: `loadCorpus` from Task 1.
- Produces: each client exports a default component that loads its own data and no longer statically imports `questions.json`. They will be embedded as tab panels in Task 4.

- [ ] **Step 1: SavedClient.** Remove `import questionsData...` / `const allQuestions`. Add corpus state:

```tsx
const [allQuestions, setAllQuestions] = useState<Question[] | null>(null);
useEffect(() => { loadCorpus().then(setAllQuestions); }, []);
```

Gate the existing `savedIds === null` skeleton to also cover `allQuestions === null` (show `<QuestionSkeleton/>` until both ready). The `questions` memo uses `allQuestions ?? []`.

- [ ] **Step 2: MistakesClient.** Same pattern: load corpus in effect, build deck only once both corpus and stats are present; keep `<QuestionSkeleton/>` while loading.

- [ ] **Step 3: ReviewClient.** Same: replace static import; `rankQuestions` runs after corpus loads.

- [ ] **Step 4: Verify**

Run: `npx tsc --noEmit`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add app/saved/SavedClient.tsx app/mistakes/MistakesClient.tsx app/review/ReviewClient.tsx
git commit -m "perf: revision clients share lazy corpus accessor"
```

---

## Task 4: `/review` hub with in-page tabs

**Files:**
- Create: `app/review/ReviewHub.tsx`
- Modify: `app/review/page.tsx`
- Modify: `app/saved/page.tsx`, `app/mistakes/page.tsx` (convert to redirects)

**Interfaces:**
- Consumes: the three client components from Task 3.
- Produces: `/review?tab=hard|saved|mistakes` route; `/saved` and `/mistakes` redirect to it.

- [ ] **Step 1: Build the hub.** `ReviewHub.tsx` is a client component: reads initial tab from `useSearchParams()` (default `hard`), renders a tab bar (3 buttons, ≥44px, active styled with `--th-accent`), and below it the matching panel (`<ReviewClient/>` for `hard`, `<SavedClient/>` for `saved`, `<MistakesClient/>` for `mistakes`). Tab change updates state AND URL via `window.history.pushState(null, "", \`/review?tab=${tab}\`)`. A `popstate` listener syncs state on back/forward.

```tsx
"use client";
import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import ReviewClient from "./ReviewClient";
import SavedClient from "@/app/saved/SavedClient";
import MistakesClient from "@/app/mistakes/MistakesClient";

const TABS = [
  { id: "hard", label: "חזרה חכמה" },
  { id: "saved", label: "שמורות" },
  { id: "mistakes", label: "הטעויות שלי" },
] as const;
type TabId = (typeof TABS)[number]["id"];

export default function ReviewHub() {
  const sp = useSearchParams();
  const initial = (sp.get("tab") as TabId) || "hard";
  const [tab, setTab] = useState<TabId>(
    TABS.some((t) => t.id === initial) ? initial : "hard"
  );
  useEffect(() => {
    const onPop = () => {
      const t = new URLSearchParams(window.location.search).get("tab") as TabId;
      setTab(TABS.some((x) => x.id === t) ? t : "hard");
    };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);
  const select = (t: TabId) => {
    setTab(t);
    window.history.pushState(null, "", `/review?tab=${t}`);
  };
  return (
    <div className="w-full flex flex-col gap-4">
      <div role="tablist" className="flex gap-2 w-full">
        {TABS.map((t) => (
          <button key={t.id} role="tab" aria-selected={tab === t.id}
            onClick={() => select(t.id)}
            className={`flex-1 min-h-11 px-3 rounded-[var(--th-radius-lg)] text-sm font-semibold transition-colors ${
              tab === t.id
                ? "bg-[var(--th-accent)] text-white"
                : "bg-[var(--th-card)] border border-[var(--th-border)] text-[var(--th-muted-strong)]"
            }`}>
            {t.label}
          </button>
        ))}
      </div>
      {tab === "hard" && <ReviewClient />}
      {tab === "saved" && <SavedClient />}
      {tab === "mistakes" && <MistakesClient />}
    </div>
  );
}
```

Note: panels already render their own `<PageShell>`. To avoid double shells, the panels are wrapped so they render content only — simplest path: keep `PageShell` in panels and render `ReviewHub` WITHOUT an outer `PageShell` (hub provides the tab bar above each panel's shell). Verify spacing visually in Playwright; if doubled, strip `PageShell` from the three clients and have the hub provide one `PageShell`.

- [ ] **Step 2: Wire the page.** `app/review/page.tsx`:

```tsx
import { Suspense } from "react";
import ReviewHub from "./ReviewHub";
export default function ReviewPage() {
  return <Suspense fallback={null}><ReviewHub /></Suspense>;
}
```

(`Suspense` required because `useSearchParams` needs it.)

- [ ] **Step 3: Redirects.** Replace `app/saved/page.tsx` and `app/mistakes/page.tsx` bodies:

```tsx
import { redirect } from "next/navigation";
export default function Page() { redirect("/review?tab=saved"); }
```

(and `?tab=mistakes` respectively). Delete now-unused `app/saved/loading.tsx` etc. only if present and broken; otherwise leave.

- [ ] **Step 4: Update internal links.** NavBar `links`: replace the `/saved` entry label/href so it points at `/review` (keep one "חזרה"/"שמורות" entry — see Task 6). Update any `<Link href="/saved">` / `/mistakes` / `/review` across `app/` to `/review?tab=...`. Grep: `rg "href=\"/(saved|mistakes|review)" app components`.

- [ ] **Step 5: Verify**

Run: `npx tsc --noEmit && npm run build`
Expected: PASS. Manually confirm `/review`, `/review?tab=saved`, `/saved` (redirects), back button.

- [ ] **Step 6: Commit**

```bash
git add app/review app/saved app/mistakes components/NavBar.tsx
git commit -m "feat: unify saved/mistakes/review into /review hub with deep-linkable tabs"
```

---

## Task 5: Static-route & prefetch audit

**Files:** none expected (verify-only; both `[topic]` routes already have `generateStaticParams`).

- [ ] **Step 1: Confirm static.** Run `npm run build` and check the route summary marks `study/[topic]` and `flashcards/[topic]` as static (●/SSG), not dynamic (ƒ). If dynamic, investigate (a `dynamic`/`headers()` call leaking in).

- [ ] **Step 2: Link audit.** `rg "<a href=\"/" app components` — ensure no internal `<a>` (should be `<Link>`). Fix any found.

- [ ] **Step 3: Commit** (only if changes)

```bash
git commit -am "perf: ensure internal navigation uses Link / static topic routes"
```

---

## Task 6: Mobile hamburger drawer

**Files:**
- Create: `components/MobileDrawer.tsx`
- Modify: `components/NavBar.tsx`

**Interfaces:**
- Consumes: the `links` array (lift to a shared const or pass as prop).
- Produces: `<MobileDrawer links={links} />`.

- [ ] **Step 1: Build the drawer.** Client component using `motion`. Props: `links: {href:string;label:string}[]`. Renders a `sm:hidden` ☰ trigger button in the bar; on open, a fixed backdrop + a right-anchored panel (`inset-y-0 end-0 w-72`) sliding in via `motion` (`x: "100%"` → `0`; RTL: end = right). Links stacked, ≥44px, active highlighted via `usePathname`. Close on: link tap, backdrop tap, Escape, route change (`useEffect` on `pathname`). Lock body scroll while open (`document.body.style.overflow`). Apply `paddingTop: env(safe-area-inset-top)` etc. on the panel.

- [ ] **Step 2: Integrate into NavBar.** At `<sm`, hide the inline `<nav>` link list (`hidden sm:flex`) and render `<MobileDrawer links={links} />` + keep streak badge + search button visible in the bar. Desktop (`sm+`) unchanged.

- [ ] **Step 3: Verify**

Run: `npx tsc --noEmit && npm run build`
Expected: PASS.

- [ ] **Step 4: Commit**

```bash
git add components/MobileDrawer.tsx components/NavBar.tsx
git commit -m "feat: mobile hamburger drawer navigation"
```

---

## Task 7: Viewport, safe-area, and touch polish

**Files:**
- Modify: `app/layout.tsx`, `app/globals.css`, `components/QuestionCard.tsx`

- [ ] **Step 1: Viewport export** in `app/layout.tsx`:

```tsx
import type { Viewport } from "next";
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f6f4ee" },
    { media: "(prefers-color-scheme: dark)", color: "#0e1014" },
  ],
};
```

- [ ] **Step 2: Safe-area** on the sticky header (`components/NavBar.tsx` `<header>`): add `style={{ paddingTop: "env(safe-area-inset-top)" }}` and horizontal insets where relevant.

- [ ] **Step 3: Hide desktop keyboard hint** in `QuestionCard.tsx`: change the hint `<p>` class to add `hidden sm:block`.

- [ ] **Step 4: Verify**

Run: `npx tsc --noEmit && npm run build`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add app/layout.tsx app/globals.css components/QuestionCard.tsx components/NavBar.tsx
git commit -m "feat: viewport/safe-area config + hide desktop keyboard hint on mobile"
```

---

## Task 8: View Transitions

**Files:**
- Modify: `next.config.ts`, `app/globals.css`, `app/layout.tsx`

- [ ] **Step 1: Enable** in `next.config.ts`:

```ts
const nextConfig: NextConfig = { experimental: { viewTransition: true } };
```

- [ ] **Step 2: Anchor header + reduced motion** in `globals.css` (per Next view-transitions guide): give `<header>` `style={{ viewTransitionName: "site-header" }}`, add `::view-transition-group(site-header){animation:none;z-index:100}` and the `@media (prefers-reduced-motion: reduce)` zeroing block. Add a default crossfade is automatic; keep it subtle.

- [ ] **Step 3: Verify graceful degradation.** Run `npm run build`; confirm no build error from experimental flag. Transitions are progressive enhancement — app must work identically with animations off.

- [ ] **Step 4: Commit**

```bash
git add next.config.ts app/globals.css app/layout.tsx
git commit -m "feat: smooth view transitions with anchored header + reduced-motion"
```

---

## Task 9: Correctness gate (Playwright + build/lint)

**Files:** none (verification).

- [ ] **Step 1:** `npx tsc --noEmit` — PASS.
- [ ] **Step 2:** `npm run lint` — PASS (fix any new warnings).
- [ ] **Step 3:** `npm run build` — PASS.
- [ ] **Step 4:** Start the app (`npm run start` after build, or `npm run dev`) and drive Playwright at a **390×844** viewport through: `/` → `/study` → a topic drill → `/exam` → `/flashcards` → a topic deck → `/review` (click all 3 tabs) → `/progress` → `/glossary` → signs (within study) → `/daily` → `/daily/history` → `/settings`. For each: assert no `console.error`, no horizontal scroll (`document.scrollingElement.scrollWidth <= innerWidth + 1`), and the page rendered. Additionally: open the mobile drawer and navigate via it; open search and confirm corpus loads + results appear; on a question, select an answer and reveal.
- [ ] **Step 5:** Record results (screenshots + console) in the commit / summary. Fix any failure and re-run from Step 1.

---

## Task 10 (OPTIONAL — deferred): `q/[id]` intercepting-route modal

Only after Tasks 1–9 are green and pushed. Add `app/@modal/(.)q/[id]/page.tsx` intercepting route + `app/layout.tsx` parallel `@modal` slot, with a server-rendered fallback `app/q/[id]/page.tsx` (already exists) for direct loads/refresh. Verify: open from search/list = overlay; refresh on the URL = full page; back closes the modal; RTL focus trap + Escape. This is its own review/verify cycle.

---

## Self-Review

- **Spec coverage:** Phase 1 → Tasks 1–3; Phase 2 → Task 5 (+2.x folded into 2/4); Phase 3 → Task 4; Phase 4 → Tasks 6–8; Phase 5 → Task 10; correctness gate → Task 9. All covered.
- **Placeholders:** none — code shown for each non-trivial change; verify-only tasks are explicitly so.
- **Type consistency:** `loadCorpus`/`getCorpusSync` used consistently in Tasks 2–3; `TabId` consistent in Task 4; `Question` type imported from `@/components/QuestionCard` everywhere (matches existing usage).
