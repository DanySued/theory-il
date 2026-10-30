> ⚠️ **SUPERSEDED by `analysis/backpocket.md`.** STALE seed only — re-verify before use.

# Fix Plan (Phase 4 output)

> Ranked by impact ÷ effort. Each fix tagged: persona, severity, effort (S/M/L), risk (low/med/high).

---

## TOP 3 to implement tonight (Phase 5)

These are the highest-impact, lowest-risk, S-effort changes implementable in ~30 min total.

---

### FIX-01 — Promote "drill mistakes" to primary CTA after a failed exam

- **Helps:** Maya (+ any user who fails)
- **Severity addressed:** 3
- **Effort:** S
- **Risk:** low
- **Friction source:** F-MAYA-02
- **What to change:** `app/results/[id]/page.tsx`
  - When `isFullExam && !passed && wrongCount > 0`: swap layout so "שגיאות (N)" is the full-width primary button (accent style, h-14) and "מבחן נוסף" becomes secondary (border style, smaller).
  - When `passed` or `wrongCount === 0`: keep current layout ("מבחן נוסף" primary).
- **Why it helps:** After failing, Maya's next move should be drilling her mistakes. The feature already exists (`/exam/retake/[id]`). Only the visual hierarchy is wrong.
- **Implementable tonight?:** yes

---

### FIX-02 — Add "exam readiness" score to progress page

- **Helps:** Maya primarily
- **Severity addressed:** 4
- **Effort:** S-M
- **Risk:** low
- **Friction source:** F-MAYA-01
- **What to change:** `app/progress/ProgressClient.tsx`
  - Add a weighted readiness score: `readiness = sum(topic_accuracy * topic_weight)` where weight = topic question count / total questions.
  - Display as a large number at the top of the page: "מוכנות לבחינה: 72%" with a color-coded bar (red <70, yellow 70-85, green ≥85).
  - Only show when at least 30 questions have been seen (below that threshold: show "ענה על עוד שאלות לחישוב").
  - Pass threshold reference: "ציון מעבר: 87% (26/30)".
- **Why it helps:** Maya can answer "should I book my test?" with one number instead of averaging 4 topic bars in her head.
- **Implementable tonight?:** yes

---

### FIX-03 — Fix misleading "1273 כרטיסיות לחזרה" on progress page

- **Helps:** Both (Yoni overwhelmed, Maya confused)
- **Severity addressed:** 3
- **Effort:** S
- **Risk:** low
- **Friction source:** F-OLEH-04
- **Root cause:** `ProgressClient.tsx` calls `getDueCards(allIds)` which returns `!c || c.dueDate <= today` — so every never-reviewed question is "due". For a new user this is all 1273.
- **What to change:** `app/progress/ProgressClient.tsx`
  - Import `getSRSCards` from `@/lib/srs`.
  - Replace the `dueCount` line: instead of `getDueCards(questions.map(q => q.id)).length`, compute it as only cards with an existing SRS record that are due: `Object.values(getSRSCards()).filter(c => c.dueDate <= localDateStr(new Date())).length`.
  - Flashcards page (`/flashcards`) keeps its current "all unseen = due" behavior — that's the right default for the flashcards feature itself.
- **Why it helps:** Progress page stat card now shows "actual SRS review debt" not "everything you haven't done yet". A new user sees 0, which is accurate — they have no cards due for spaced repetition review.
- **Implementable tonight?:** yes

---

## All other fixes (proposals only — Phase 5 does NOT touch these)

---

### FIX-04 — Default to "תרגול" tab when coming from homepage CTA

- **Helps:** Yoni
- **Severity addressed:** 3
- **Effort:** S
- **Risk:** low
- **Friction source:** F-OLEH-03
- **What to change:**
  - Change homepage CTA href from `/study/תמרורים` to `/study/תמרורים?view=drill`
  - In `DrillClient.tsx`: read `searchParams.get("view")` and set initial `view` state to `"drill"` if `view=drill`.
- **Why not tonight?:** Cap is 3 fixes. This is #4 by impact. Implement next session.

---

### FIX-05 — Generate explanations for all 1273 questions (DATA)

- **Helps:** Both (Sev 5 for both personas)
- **Severity addressed:** 5
- **Effort:** L (data pipeline, not UI)
- **Risk:** med (AI-generated content needs review)
- **Friction source:** F-OLEH-01, F-MAYA-06
- **What to change:**
  - Write a Node.js script that loops over `questions.json`, calls Claude API (claude-haiku-4-5) for each question, and writes explanations back.
  - Prompt: given question text + answer options + correct answer → generate a 1-2 sentence Hebrew explanation of WHY the correct answer is right, referencing the relevant traffic law or safety principle.
  - Estimate: ~1273 API calls at $0.0001/call ≈ $0.13 total. Fast and cheap.
  - Human review pass on a sample (5-10%) before shipping.
- **Why not tonight?:** Not a UI fix — it's a data generation task. Requires a separate script run and review. Leave for Dany to greenlight.

---

### FIX-06 — Driving vocabulary glossary

- **Helps:** Yoni primarily
- **Severity addressed:** 4
- **Effort:** M
- **Risk:** low
- **Friction source:** F-OLEH-02
- **What to change:**
  - Create `/glossary` page with ~30 key driving terms (נתיב, עקיפה, צומת, תמרור, etc.) + Hebrew plain-language definitions.
  - Link from nav or settings.
  - Optional: word detection in question text + tooltip on tap/hover.
- **Why not tonight?:** Content writing required (the term list + definitions). UI work is S, but content is M. Leave for Dany.

---

### FIX-07 — Surface ContinueTile in hero for returning users

- **Helps:** Yoni
- **Severity addressed:** 2
- **Effort:** M
- **Risk:** low
- **Friction source:** F-OLEH-05
- **What to change:** In homepage hero section, read localStorage for last study position and show a personalized subtitle ("ממשיכים מ-תמרורים שאלה 14?") replacing the generic subtitle when returning data exists.
- **Why not tonight?:** Nice-to-have. Hero is "use client" already so it's feasible, but low impact vs effort.

---

### FIX-08 — Score trend / week-over-week delta on progress

- **Helps:** Maya
- **Severity addressed:** 2
- **Effort:** M
- **Risk:** low
- **Friction source:** F-MAYA-05
- **What to change:** Compute rolling 7-day exam average from `listAttempts()` and display as a delta arrow on the progress page.
- **Why not tonight?:** Nice-to-have. Proposals only.
