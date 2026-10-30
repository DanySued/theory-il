# Friction Log — Maya (Israeli Sophomore)

> Phase 3 walkthrough complete. Playwright + code review.

## Walkthrough tasks completed

1. ✅ Open `/` — measured clicks to exam
2. ✅ Navigated to `/exam`, configured and started exam
3. ✅ Submitted exam, landed on `/results/[id]`
4. ✅ Read results page source (`results/[id]/page.tsx`)
5. ✅ Navigated to `/progress`
6. Reviewed ExamStartScreen, ExamRunner, ProgressClient source

---

## Findings

### F-MAYA-01
- **Where:** `/progress`
- **What happened:** Progress page shows 4 per-topic accuracy bars (e.g. "תמרורים: 0% · חוקי התנועה: טרם תורגל") and a recent exams list. There is NO synthesized "exam readiness" number. Maya has to mentally average 4 percentages and map them to "will I pass the 26/30 threshold?"
- **What Maya thinks:** "אני רואה את האחוזים לפי נושאים אבל לא יודעת אם אני מוכנה לבחינה. כמה אני צריכה להיות?"
- **Severity:** 4 — this is Maya's core need. She's grinding toward a pass. Without a readiness signal, she can't answer "should I book my test?"
- **Screenshot:** sophomore-04-progress.png
- **Suggested fix:** M effort: Compute a weighted readiness score (weighted by topic question count) displayed as a headline number + pass/fail threshold indicator. Could be implemented tonight with ~30 lines in ProgressClient. **→ FIX-02 (implementable tonight).**

### F-MAYA-02
- **Where:** `/results/[id]` — after a failed exam
- **What happened:** The results page has a large "מבחן נוסף" (Another exam) as the primary CTA. The "שגיאות (N)" retake button exists but is placed in a 2×2 secondary button grid alongside "חזרה ללמוד", "שתף", "DOCX". After failing, Maya's most natural next action is to drill her mistakes, but the UI's visual hierarchy pushes "Another exam" first.
- **What Maya thinks:** "ראיתי ש'שגיאות' קיים — אבל ממש לא בולט. קרוב לכפתורי ייצוא."
- **Severity:** 3 — the feature exists; the problem is hierarchy. "שגיאות" should be co-primary with "מבחן נוסף" after a failed exam.
- **Screenshot:** sophomore-03-results.png
- **Suggested fix:** S effort: In `results/[id]/page.tsx`, when `!passed && wrongCount > 0`, swap button layout — make "שגיאות" the top primary button and "מבחן נוסף" secondary. **→ FIX-01 (implementable tonight).**

### F-MAYA-03
- **Where:** `/` — homepage hero
- **What happened:** The hero CTA "בוא נתחיל בתמרורים?" sends to topic study, not the exam. Maya uses the nav "מבחן" to get there (2 clicks total: nav + "התחל מבחן"). Acceptable — 2 clicks is fine.
- **What Maya thinks:** "יש 'מבחן' בניווט, אז זה בסדר."
- **Severity:** 2 — not painful. The nav bar is always present and "מבחן" is a clear label.
- **Screenshot:** sophomore-01-homepage.png
- **Suggested fix:** Low priority — the study CTA makes sense for new users. Could add a second CTA "מבחן תרגול ←" as a text link below the main button. Proposal only.

### F-MAYA-04 (POSITIVE — no friction)
- **Where:** `/exam` — start screen
- **What happened:** Exam config defaults to 30 questions + all topics — exactly what the real test is. Maya sees "לעבור צריך 26 תשובות נכונות מתוך 30" (pass threshold) before starting. One click to begin.
- **What Maya thinks:** "מושלם. 30 שאלות, לחץ התחל, קדימה."
- **Severity:** N/A — this is done right. No change needed.

### F-MAYA-05
- **Where:** `/progress` — recent exams section
- **What happened:** The recent exams list shows individual scores (e.g. "0/30 · 17 ביוני") but no trend. After 5 exams Maya can't see "I went from 40% → 3% → 0% → ..." — only the last 5 individual results.
- **What Maya thinks:** "אני רואה כל מבחן בנפרד אבל לא האם אני משתפרת."
- **Severity:** 2 — nice-to-have. Not blocking. Proposal only for fix-plan.

### F-MAYA-06 — Shared with Yoni
- **Where:** Results page + all question views
- **What happened:** No explanations for any of the 1273 questions (same as F-OLEH-01). After a wrong answer, Maya sees the correct option highlighted but doesn't know WHY. Critical for the "drill mistakes" workflow.
- **What Maya thinks:** "ראיתי שתשובה ג' נכונה, אבל לא יודעת למה. אני זוכרת 'ג' אבל לא מבינה."
- **Severity:** 5 — same as for Yoni. The highest-severity issue in the entire app.
- **Suggested fix:** Same as F-OLEH-01 — data pipeline to generate explanations. Proposal only for tonight.
