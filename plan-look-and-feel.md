# Look & Feel Overhaul — Phased Plan

**Goal**: Eliminate the "off" feeling caused by inconsistent containers, spacing, headings, and card languages across all pages.

**How to run**: each phase is independent and idempotent. Execute one phase per session. Mark a phase `DONE` when the listed deliverables are committed. The auto-push Stop hook will deploy each phase.

---

## PHASE STATUS
- [ ] Phase 1 — Foundation tokens + `PageShell`
- [ ] Phase 2 — Adopt `PageShell` everywhere + unify back-button slot
- [ ] Phase 3 — Unify cards (`TopicCard`, `SectionHead`)
- [ ] Phase 4 — Fix loading skeletons + remove layout shift
- [ ] Phase 5 — Heading/eyebrow normalization + polish pass

---

## PHASE 1 — Foundation: spacing tokens, container token, `PageShell`

**Why first**: every later phase consumes these primitives.

### Tasks
1. In `app/globals.css`, add tokens:
   ```css
   --th-container: 48rem;     /* 3xl — the One True Width */
   --th-container-wide: 72rem; /* 6xl — only for NavBar + future wide grids */
   --th-page-px: 1.5rem;       /* px-6 */
   --th-page-py: 2rem;         /* py-8 */
   --th-page-gap: 2rem;        /* gap-8 */
   --th-section-gap: 3.5rem;   /* py-14 between marketing sections */
   ```
2. Create `components/PageShell.tsx`:
   - Props: `{ children, showBack?: boolean (default true), wide?: boolean }`.
   - Renders `<main>` with `flex flex-1 flex-col items-center` and applies the container width + padding + gap from tokens.
   - Internally renders a `<BackSlot />` at the top when `showBack`. Slot is `w-full` wrapped to the same container width — so back button position is identical on every page.
3. Add `components/SectionHead.tsx`:
   - Props: `{ eyebrow?: string, title: string, subtitle?: string, align?: "start" | "center" }`.
   - Uses `th-eyebrow` + `th-page-title` + muted-strong subtitle.

### Deliverables
- `globals.css` updated
- `PageShell.tsx`, `SectionHead.tsx` added
- No page changes yet (Phase 2)
- Commit message: `feat(design): introduce PageShell + SectionHead primitives and spacing tokens`

### Verification
- Run `npm run build` — must pass.
- No visual regression yet (nothing wired in).

---

## PHASE 2 — Adopt `PageShell` on every interior page

### Tasks
Replace per-page `<main>` + back-button wrapper with `<PageShell>` on:
- `app/study/page.tsx`
- `app/flashcards/page.tsx`
- `app/exam/page.tsx` (start screen) — drop `max-w-lg`, use shell width; ExamRunner stays as-is for now
- `app/results/[id]/page.tsx`
- `app/study/[topic]/page.tsx` + `DrillClient` shell (use `wide` for the drill grid area)

Delete the duplicated `<div className="w-full max-w-X flex justify-start"><BackButton /></div>` blocks; `PageShell` owns it.

Update `ExamStartScreen.tsx`:
- Remove the centered `text-center` on the heading — match other pages' start-aligned headings (RTL: right-aligned).
- Drop internal max-width assumptions; let `PageShell` own width.

### Deliverables
- All listed pages migrated
- Back button lands at identical x on every page
- Commit: `refactor(layout): adopt PageShell across all interior pages`

### Verification
- Open `/`, `/study`, `/exam`, `/flashcards`, `/study/חוקי התנועה`, navigate between them. Back button must not shift. Container must not shift.

---

## PHASE 3 — Unify cards

### Tasks
1. Create `components/TopicCard.tsx`:
   - Props: `{ index?: number, title: string, meta: string, badge?: ReactNode, href: string, accentDot?: string }`.
   - Single visual language: `p-6 rounded-[var(--th-radius-lg)] bg-card border hover:border-accent hover:-translate-y-0.5`, optional numbered index, optional bottom badge (used for "due today" + sign category dot + progress bar).
   - Support a `progress` slot (the bar from `TopicGridClient`).
2. Migrate all four grids to use `TopicCard`:
   - `TopicGridClient` (study)
   - `app/flashcards/page.tsx` grid
   - Home topic grid (`TOPICS.map`)
   - Home sign-category list (`SIGN_CATEGORIES.map`) — uses `accentDot`
3. Normalize arrow glyph: always use `←` rendered with `ms-2` (RTL).

### Deliverables
- One card component, four call sites
- Commit: `refactor(ui): unify topic cards into single TopicCard component`

### Verification
- All four grids visually consistent (radius, padding, shadow, hover).
- No regression in progress bar or "due today" badge.

---

## PHASE 4 — Loading skeletons match real pages (kill layout shift)

### Tasks
1. Update every `loading.tsx` to use the same `PageShell` + matching container width as the real page:
   - `app/loading.tsx` → `PageShell` default width (was `max-w-6xl` — wrong)
   - `app/study/loading.tsx` → already correct, just route through `PageShell`
   - `app/flashcards/loading.tsx` → same
   - `app/exam/loading.tsx` → switch from `max-w-lg` to default shell
   - `app/study/[topic]/loading.tsx` → fix the `max-w-6xl` then `max-w-2xl` jump
   - `app/flashcards/[topic]/loading.tsx` → align with runner
2. Use `SectionHead` skeleton sizing — same heights as the real `th-page-title` so hydration is invisible.

### Deliverables
- Zero layout shift on hydration across all routes
- Commit: `fix(loading): align skeletons with real layouts to eliminate CLS`

### Verification
- Throttle network in DevTools → 3G; reload each route; the page must NOT jump when content swaps in. Visually verify by watching the back button — it should stay still.

---

## PHASE 5 — Heading/eyebrow normalization + final polish

### Tasks
1. Audit every page heading. Replace raw `text-2xl/3xl/4xl font-bold` with `th-page-title` or `th-section-h`:
   - `app/results/[id]/page.tsx` (multiple)
   - `app/study/[topic]/DrillClient.tsx`
   - Any place in `ExamRunner.tsx` and `FlashcardRunner.tsx` that uses raw font sizes for primary headings
2. Add eyebrow to:
   - `/results/[id]` — "תוצאות · מבחן תרגול"
   - `/study/[topic]` drill view — "לימוד · {topic}"
3. Normalize border-radius:
   - Cards: always `--th-radius-lg`
   - Buttons (pill): `rounded-full` OK
   - Inputs / small chips: `--th-radius-sm`
4. Normalize hover:
   - All clickable cards: `hover:border-accent`, `hover:-translate-y-0.5`, `transition-all`
   - All buttons: shadow change only, no translate
5. Normalize arrow glyph everywhere (`←` with `ms-2`).
6. Smoke-test dark mode quickly: load each page in `prefers-color-scheme: dark` and screenshot.

### Deliverables
- Pages share one heading hierarchy
- Visual consistency pass complete
- Commit: `polish(ui): normalize headings, eyebrows, radii, hover across all pages`

### Verification
- Click through every route. The app should feel like one app.

---

## OUT OF SCOPE (track separately)
- Animations / motion choreography
- Dark mode tuning beyond smoke-test
- New illustrations / icons
- Question/Drill UX redesign
- Mobile-specific tuning beyond what tokens give us

---

## /loop runner instructions

When `/loop` resumes, do this:
1. Read this file.
2. Find the first unchecked phase under PHASE STATUS.
3. Execute its Tasks and Deliverables.
4. Run `npm run build` to verify.
5. Commit with the listed message (auto-push hook will deploy).
6. Tick the box for that phase in this file and commit again (one-line edit).
7. Stop. The next loop iteration picks up the next phase.

If `npm run build` fails: do NOT tick the box. Fix or revert, then stop with an explanation so the user can intervene.
