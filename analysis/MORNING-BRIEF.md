> ⚠️ **ARCHIVED (prior run, commit 146bff2).** STALE. The current run rewrites this at finish.

# Morning Brief — theory-il overnight analysis

Commit: `146bff2` (local only, not pushed)

---

## TL;DR

- **Biggest problem in the app:** 0 out of 1273 questions have explanations. The explanation UI exists (QuestionCard renders it), but the data field is empty everywhere. Answering wrong gives you zero feedback on why. This is the #1 thing to fix — but it's a data task, not a UI task.
- **3 fixes shipped tonight:** drill-mistakes CTA promoted on results page, exam readiness score added to progress, fake "1273 flashcards due" corrected to 0.
- **5 proposals in `analysis/fix-plan.md`** for your next session, ranked and ready to implement.

---

## What shipped (3 fixes, commit 146bff2)

### FIX-01 — Results page: "תרגל שגיאות" is now the primary CTA after failing

**File:** `app/results/[id]/page.tsx`

When: full 30-question exam, score < 26, and there are wrong answers.

Before: "מבחן נוסף" was always the large primary button. "שגיאות (N)" was one of four small buttons in a 2×2 utility grid next to "שתף" and "DOCX". Maya had to hunt for it.

After: "תרגל שגיאות (N)" is the full-width accent button (h-14). "מבחן נוסף" moves to secondary (h-11, border style). On passing exams or non-full exams, behavior is unchanged.

**How to test:** Take a 30-question exam and fail (score < 26). The big blue button should now say "תרגל שגיאות (N)".

---

### FIX-02 — Progress page: exam readiness score

**File:** `app/progress/ProgressClient.tsx`

Added `ReadinessCard` component at the top of the progress page.

- Shows "ענה על N שאלות נוספות" until 30 questions have been answered (threshold avoids noisy early scores)
- Once ≥30 seen: shows a large % number with color coding (red <70%, yellow 70–86%, green ≥87%)
- Formula: `sum(topic_accuracy × topic_question_count) / 1273` — gives expected exam score if topics sampled proportionally
- Pass threshold reference: "סף מעבר: 87%" (= 26/30)

**How to test:** Answer 30+ questions across topics. Progress page should show a readiness % at the top.

**Known limitation:** Score drops quickly when you start new topics (accuracy starts at 0 for unseen topics). This is intentional — it correctly shows you're not ready for questions you've never seen. After drilling those topics the score rises.

---

### FIX-03 — Progress page: flashcard due count no longer shows 1273 on first visit

**File:** `app/progress/ProgressClient.tsx`

Before: `getDueCards(allIds)` counted every unseen question as "due". New user saw "1273 כרטיסיות לחזרה" — demotivating.

After: counts only SRS cards with a review record AND `dueDate <= today`. New user sees "0 כרטיסיות".

Note: the `/flashcards` page itself still shows all unseen cards as "due" (correct behavior — it needs to let new users start). Only the progress stat card is changed.

**How to test:** Clear localStorage, visit `/progress`. The "לחזרה" stat card should show 0, not 1273.

---

## Top proposals NOT implemented tonight (read fix-plan.md for full details)

| # | Fix | Why not tonight |
|---|-----|----------------|
| FIX-04 | Default to "תרגול" tab when CTA sends to signs study | Cap of 3 fixes — #4 by priority |
| **FIX-05** | **Generate explanations for all 1273 questions via AI** | **Needs your go-ahead — data pipeline, ~$0.13 in API costs** |
| FIX-06 | Driving vocabulary glossary | Content writing required, not just code |
| FIX-07 | Surface "continue" in homepage hero for returning users | Nice-to-have |
| FIX-08 | Week-over-week exam score delta on progress | Nice-to-have |

**FIX-05 is the highest-leverage thing you can do next.** It requires a Node.js script that batch-calls Claude to generate Hebrew explanations for each question. If you want me to write it, say the word.

---

## Blockers / open questions for Dany

1. **FIX-05 (explanations):** Worth doing? It would transform the app from "answer + see correct answer" to "answer + learn why". ~$0.13 in API costs, ~2 hour script run, then human spot-check. Very high impact for both personas.

2. **FIX-06 (glossary):** Do you want a glossary page for new immigrants? I can generate the ~30 key driving terms + definitions. Let me know.

3. **ReadinessCard formula:** The current formula penalizes low coverage (if you've only done תמרורים, score reflects "ready for 28% of exam"). Is this the UX you want, or would you prefer "accuracy on what you've studied" (simpler, but less useful for predicting pass/fail)?

---

## Analysis artifacts

- `analysis/personas.md` — full journey scripts for Yoni + Maya
- `analysis/friction-log-oleh.md` — 6 findings from Yoni's walkthrough
- `analysis/friction-log-sophomore.md` — 6 findings from Maya's walkthrough
- `analysis/fix-plan.md` — 8 fixes ranked by impact/effort
- `analysis/screenshots/` — 10 screenshots from playwright walkthrough
