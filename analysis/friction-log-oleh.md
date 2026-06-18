# Friction Log — Yoni (Oleh Chadash)

> Phase 2 walkthrough complete. Playwright + code review.

## Walkthrough tasks completed

1. ✅ Open `/` — hero visible, CTA clear
2. ✅ Clicked primary CTA "בוא נתחיל בתמרורים?" → landed on signs page
3. ✅ Answered sign questions on `/study/תמרורים`
4. ✅ Got answer wrong — observed feedback
5. ✅ Opened `/daily` challenge
6. ✅ Checked `/progress` after 2 questions
7. Code-reviewed `QuestionCard.tsx`, `DrillClient.tsx`, `questions.json`

---

## Findings

### F-OLEH-01
- **Where:** `/study/תמרורים` (and all question views)
- **What happened:** After answering (right or wrong), NO explanation appears. Code in `QuestionCard.tsx:237` shows `{showAnswer && question.explanation && <p>…</p>}` — explanation rendering is implemented but `questions.json` has 0/1273 explanations (verified: `explanation: undefined` for all questions).
- **What Yoni thinks:** "אני טעיתי אבל לא יודע למה. לא הבנתי את ההסבר — כי אין הסבר."
- **Severity:** 5 — worst friction point. Core learning loop is broken: answer → no feedback → no learning → quit.
- **Screenshot:** oleh-04-wrong-answer-feedback.png
- **Suggested fix:** Data problem. Options: (a) AI batch-generate explanations for all 1273 questions, (b) "הסבר מהיר" button that calls Claude/Gemini inline per question. Option (a) is a data pipeline task, not a UI fix. Not implementable tonight — goes to fix-plan as priority proposal.

### F-OLEH-02
- **Where:** Any question with driving vocabulary
- **What happened:** Questions use terms like נתיב (lane), עקיפה (overtaking), צומת מרומזר (signalized intersection), מתן זכות קדימה (yielding) with no tooltip, glossary, or hover definition. Yoni must open Google Translate.
- **What Yoni thinks:** "מה זה 'עקיפה'? אני מבין עברית אבל לא מילים של נהיגה."
- **Severity:** 4 — kills comprehension mid-question. App becomes unusable for new immigrants on ~40% of questions.
- **Screenshot:** (not separately captured — affects any text-only question)
- **Suggested fix:** M effort: (a) add a glossary page `/glossary` with ~30 key terms, link from nav/settings, (b) or highlight known driving terms with tooltip on tap/hover. Proposal for fix-plan — not tonight (requires term extraction + content writing).

### F-OLEH-03
- **Where:** `/study/תמרורים` — initial landing after clicking homepage CTA
- **What happened:** CTA "בוא נתחיל בתמרורים?" lands on the "לימוד" (catalog) tab, not "תרגול" (questions). Yoni sees 5 category buttons (אזהרה, חובה, etc.) with 0/47 progress counters — looks like a checklist, not a place to start. He has to discover and click the "תרגול" tab.
- **What Yoni thinks:** "זה לא שאלות? מה אני עושה פה?" — risk of abandonment at J2.
- **Severity:** 3 — a 1-click fix away from working, but Yoni won't intuit the tab.
- **Screenshot:** oleh-02-signs-study.png
- **Suggested fix:** S effort: homepage CTA should link to `/study/תמרורים?mode=drill` and DrillClient should read the `mode` param to set initial view to `"drill"`. **Implementable tonight → FIX-04.**

### F-OLEH-04
- **Where:** `/progress` → stat card "לחזרה"
- **What happened:** Stat card shows "1273 כרטיסיות" labeled "לחזרה" on first visit. This is every question in the bank, before the user has seen anything. SRS considers unseen cards as "due".
- **What Yoni thinks:** "1273?! זה בלתי אפשרי. אני לא רוצה להתחיל."
- **Severity:** 3 — demotivating on the first visit to progress. Triggers overwhelm.
- **Screenshot:** oleh-06-progress-after-q.png
- **Suggested fix:** S effort: `getDueCards` or the SRS should not count cards never seen as "due". Due = seen at least once AND SRS interval elapsed. **Implementable tonight → FIX-03.**

### F-OLEH-05
- **Where:** `/` — homepage above-fold
- **What happened:** The daily challenge tile and ContinueTile are below the hero. On the hero, only the streak badge and the "בוא נתחיל בתמרורים?" CTA are visible. A returning Yoni sees the same hero as day 1 — no visible memory of where he was.
- **What Yoni thinks:** "אני לא זוכר איפה הייתי. כנראה מתחיל מחדש."
- **Severity:** 2 — the ContinueTile exists and works (saves position per topic), but it's below the fold.
- **Screenshot:** oleh-01-homepage.png (need to scroll to see tile)
- **Suggested fix:** M effort: surface the "continue" message in the hero itself (personalized subtitle when localStorage has data). Proposal only — requires client-side read in hero.

### F-OLEH-06 (POSITIVE — no friction)
- **Where:** `/daily`
- **What happened:** Daily challenge is exactly 3 questions, clearly labeled "כדקה" (about a minute), with progress bar "1 מתוך 3". Warm, achievable, feels like a win.
- **What Yoni thinks:** "3 שאלות זה בסדר. אני יכול לעשות את זה."
- **Severity:** N/A — this works well. No fix needed.
