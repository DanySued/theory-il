export type Locale = "he" | "en";

export const UI: Record<string, Record<Locale, string>> = {
  "nav.home":           { he: "תיאוריה", en: "Theory" },
  "nav.study":          { he: "לימוד", en: "Study" },
  "nav.exam":           { he: "מבחן", en: "Exam" },
  "nav.flashcards":     { he: "כרטיסיות", en: "Flashcards" },
  "home.title":         { he: "מתכוננים לתיאוריה?", en: "Preparing for the Theory Test?" },
  "home.subtitle":      { he: "לומדים עם שאלות מהמאגר הרשמי של משרד התחבורה.\nמצב לימוד, מבחן מדומה ובדיקת תשובות — הכל במקום אחד.", en: "Study with official questions from the Israeli Ministry of Transport.\nStudy mode, mock exam, and answer review — all in one place." },
  "home.start_study":   { he: "התחל ללמוד", en: "Start Studying" },
  "home.start_exam":    { he: "מבחן מדומה", en: "Mock Exam" },
  "home.attribution":   { he: "שאלות: משרד התחבורה והבטיחות בדרכים, data.gov.il, רישיון CC-BY", en: "Questions: Israeli Ministry of Transport, data.gov.il, CC-BY license" },
  "study.title":        { he: "לימוד לפי נושאים", en: "Study by Topic" },
  "study.subtitle":     { he: "בחר נושא ללמידה", en: "Choose a topic" },
  "study.questions":    { he: "שאלות", en: "questions" },
  "study.seen":         { he: "נצפו", en: "seen" },
  "study.correct":      { he: "נכונות", en: "correct" },
  "drill.all_topics":   { he: "כל הנושאים", en: "All Topics" },
  "drill.study_tab":    { he: "לימוד", en: "Study" },
  "drill.drill_tab":    { he: "תרגול", en: "Practice" },
  "drill.weak_only":    { he: "שאלות קשות בלבד", en: "Weak questions only" },
  "drill.jump_to":      { he: "קפוץ לשאלה:", en: "Jump to question:" },
  "drill.go":           { he: "עבור", en: "Go" },
  "drill.no_weak":      { he: "אין עדיין שאלות קשות — ענה על כמה שאלות קודם", en: "No weak questions yet — answer some questions first" },
  "exam.submit":        { he: "סיים מבחן", en: "Submit Exam" },
  "exam.answered":      { he: "נענו", en: "answered" },
  "exam.confirm_title": { he: "לסיים את המבחן?", en: "Submit the exam?" },
  "exam.confirm_body":  { he: "ענית על {answered} מתוך {total} שאלות. {unanswered} שאלות עדיין לא נענו.", en: "You answered {answered} out of {total} questions. {unanswered} questions remain unanswered." },
  "exam.continue":      { he: "המשך מבחן", en: "Continue Exam" },
  "exam.submit_anyway": { he: "סיים בכל זאת", en: "Submit Anyway" },
  "results.pass":       { he: "עברת! ✓", en: "Passed! ✓" },
  "results.fail":       { he: "לא עברת ✗", en: "Failed ✗" },
  "results.time":       { he: "זמן", en: "Time" },
  "results.pass_score": { he: "ציון מעבר", en: "Passing score" },
  "results.new_exam":   { he: "מבחן נוסף", en: "New Exam" },
  "results.back_study": { he: "חזרה ללמוד", en: "Back to Study" },
  "results.share":      { he: "שתף תוצאות", en: "Share Results" },
  "results.review":     { he: "סקירת שאלות", en: "Question Review" },
  "results.q_num":      { he: "שאלה", en: "Question" },
  "results.correct_ans":{ he: "✓ נכון", en: "✓ Correct" },
  "results.wrong_ans":  { he: "✗ לא נכון", en: "✗ Wrong" },
  "results.unanswered": { he: "לא נענתה", en: "Unanswered" },
  "results.your_answer":{ he: "← תשובתך", en: "← Your answer" },
  "flashcards.title":   { he: "כרטיסיות — חזרה מרווחת", en: "Flashcards — Spaced Repetition" },
  "flashcards.due":     { he: "לחזרה היום", en: "Due today" },
  "flashcards.start":   { he: "התחל חזרה", en: "Start Review" },
  "flashcards.no_due":  { he: "אין כרטיסיות לחזרה — חזור מחר!", en: "No cards due — check back tomorrow!" },
  "flashcards.knew":    { he: "ידעתי", en: "Knew it" },
  "flashcards.kinda":   { he: "בערך", en: "Sort of" },
  "flashcards.forgot":  { he: "לא ידעתי", en: "Forgot" },
  "flashcards.done_title":{ he: "סיימת!", en: "Done!" },
  "flashcards.done_body":{ he: "עברת על {count} כרטיסיות היום.", en: "You reviewed {count} cards today." },
  "flashcards.done_next":{ he: "הבא: {date}", en: "Next: {date}" },
  "flashcards.back":    { he: "חזרה לכרטיסיות", en: "Back to Flashcards" },
  "q.reveal":           { he: "הצג תשובה", en: "Show Answer" },
  "q.prev":             { he: "הקודמת", en: "Previous" },
  "q.next":             { he: "הבאה", en: "Next" },
  "q.of":               { he: "מתוך", en: "of" },
  "q.keyboard_hint":    { he: "← → לניווט · 1–4 לבחירה · רווח להצגת תשובה", en: "← → navigate · 1–4 choose · Space reveal" },
  "streak.days":        { he: "ימים רצופים", en: "day streak" },
  "streak.day":         { he: "יום", en: "day streak" },
};

export function t(key: string, locale: Locale, vars?: Record<string, string | number>): string {
  let str = UI[key]?.[locale] ?? UI[key]?.["he"] ?? key;
  if (vars) {
    for (const [k, v] of Object.entries(vars)) {
      str = str.replace(`{${k}}`, String(v));
    }
  }
  return str;
}
