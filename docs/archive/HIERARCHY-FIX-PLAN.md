# Visual Hierarchy Fix Plan — theory-il

Expert UI/UX review (2026-06-11). Guiding principle: contextual labels shrink, action-driving
content grows; at least 2 type-scale steps between a context label and the heading below it.

## 1. Hub pages: giant contextual titles dwarf the actual choices (HIGH)

**Files:** `app/study/page.tsx:34`, `app/flashcards/page.tsx:36`, `components/ExamStartScreen.tsx:26`

The h1s ("לימוד לפי נושאים", "כרטיסיות", "מבחן מדומה") are `text-4xl sm:text-5xl font-extrabold` —
largest type on screen. But the user navigated here from the navbar, so the title is contextual.
The action-driving topic cards are only `text-xl`/`text-2xl`.

**Fix:**
- `app/study/page.tsx` + `app/flashcards/page.tsx`: demote h1 to `text-2xl font-bold`
  (keep the eyebrow above it). Cards become the visual peak.
- `ExamStartScreen.tsx`: shrink h1 one step to `text-3xl` only — the CTA button is the hero there.

## 2. Results page: primary CTA equals its four secondary siblings (HIGH)

**File:** `app/results/[id]/page.tsx:186-235`

"מבחן נוסף" (primary) is `text-sm py-3`; the four secondary buttons are `text-sm py-2.5`.
Hierarchy carried only by color.

**Fix:** Make the primary CTA `h-12`–`h-14`, `text-base font-semibold` (matching home page CTA
at `app/page.tsx:27`). Keep secondaries at `text-sm`.

## 3. Inconsistent card-title scale between the two topic grids (MEDIUM)

**Files:** `components/TopicGrid.tsx:35` (`text-xl font-bold`) vs `app/flashcards/page.tsx:62`
(`text-2xl font-extrabold`)

Same role ("pick a topic"), different scale.

**Fix:** Unify on `text-2xl font-extrabold` in both (cards should be loudest per #1).

## 4. Tiny tap target as the only fallback action (MEDIUM)

**File:** `components/StudyGuide.tsx:62`

Related-question "הצג תשובה" button is `text-[10px]` — smallest text in the app, yet interactive.

**Fix:** Bump to `text-xs font-medium` with `py-1.5 px-2` padding for a usable hit area.

## 5. Navigation arrows compete with the question text (LOW)

**File:** `components/QuestionCard.tsx:213,222`

Arrow glyphs in הקודמת/הבאה are `text-xl font-bold` accent-colored — same size as the question
text itself (line 143).

**Fix:** Drop arrows to `text-base`, inherit button text color (accent on hover only is fine).

## 6. Results review: verdict ties with question text (LOW)

**File:** `app/results/[id]/page.tsx:261,284`

Verdict ("✓ נכון" / "✗ לא נכון") is `text-sm font-bold`; question is `text-sm font-semibold`.

**Fix:** Verdict → `text-xs font-bold` (card border/background color already encodes status);
question → `text-base font-semibold`.

## 7. Completion screen: emoji outranks the headline (LOW)

**File:** `components/FlashcardRunner.tsx:48-49`

🎉 at `text-5xl` above "סיימת!" at `text-3xl`.

**Fix:** Shrink emoji to `text-4xl` (or grow h1) so the headline leads.

---

**Deliberately not flagged:** SignCard internal scale (settled after iteration; density constraint)
and the home page (best hierarchy in the app — the reference).

**Verification:** run `npm run build` (or lint) after edits; no logic changes, classNames only.
