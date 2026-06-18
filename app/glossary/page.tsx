"use client";

import { useMemo, useState } from "react";
import PageShell from "@/components/PageShell";
import SectionHead from "@/components/SectionHead";

const TERMS = [
  { term: "נתיב", def: "פס נסיעה מסומן על הכביש שבו נוסע רכב אחד." },
  { term: "עקיפה", def: "פעולת מעבר רכב מנתיב אחד לנתיב אחר כדי לחלוף לפני רכב אחר." },
  { term: "צומת", def: "מקום שבו נפגשות שתי דרכים או יותר." },
  { term: "תמרור", def: "שלט רשמי בצד הדרך המורה לנהגים על חוקים, אזהרות או מידע." },
  { term: "מעבר חצייה", def: "רצועה מסומנת בכביש שנועדה להולכי רגל לחצות בבטחה." },
  { term: "ציר", def: "דרך ראשית מחברת בין ערים או אזורים, בדרך כלל ממוספרת." },
  { term: "רכב ביטחון", def: "רכב של כוחות הביטחון (משטרה, צבא, מגן דוד אדום) הנהנה מזכויות עדיפות בדרך." },
  { term: "רמזור", def: "מכשיר אורות אדום-צהוב-ירוק השולט בתנועה בצומת." },
  { term: "קו עצירה", def: "קו לבן רחב המסומן על הכביש לפני צומת או מעבר חצייה שלפניו חובה לעצור." },
  { term: "שדה ראייה", def: "טווח הראייה שיש לנהג לכל הכיוונים בנקודה מסוימת בדרך." },
  { term: "תאונה", def: "אירוע בלתי מתוכנן בדרך שגרם לנזק לרכב, לרכוש או לפציעת אדם." },
  { term: "רישיון", def: "מסמך רשמי המאשר לאדם לנהוג ברכב מסוג מסוים." },
  { term: "חניה", def: "עצירת הרכב למשך זמן ממושך במקום ייעודי או מותר." },
  { term: "עצירה", def: "הפסקת תנועת הרכב לזמן קצר לצורך הורדת נוסעים או בגלל אות עצור." },
  { term: "כביש מהיר", def: "דרך מחולקת ללא צמתים ממוגנים, בה מותר לנסוע במהירויות גבוהות." },
  { term: "כביש בין-עירוני", def: "דרך המחברת בין שתי ערים שאינה בתוך אזור עירוני." },
  { term: "דרך עירונית", def: "כביש הנמצא בתוך גבולות עיר או ישוב, עם הגבלות מהירות נמוכות יותר." },
  { term: "מהירות מרבית", def: "המהירות הגבוהה ביותר שמותר לנסוע בה בדרך מסוימת לפי החוק." },
  { term: "מרחק עצירה", def: "המרחק הכולל שהרכב נוסע מרגע שהנהג רואה סכנה ועד שהרכב נעצר לחלוטין." },
  { term: "נקודות זכות", def: "מערכת ניקוד הניתנת לכל נהג חדש, ונקודות נגרעות על עבירות תנועה." },
  { term: "ביטוח חובה", def: "ביטוח חוקי חובה לכל רכב המכסה פגיעה בנפש של נפגעי תאונות." },
  { term: "רכב מסחרי", def: "רכב המשמש להובלת טובין או מטען, כגון משאית או טנדר." },
  { term: "רכב פרטי", def: "רכב נוסעים שנועד לשימוש פרטי ומספר מושביו לא עולה על תשעה." },
  { term: "גלגל הגה", def: "ההתקן שבעזרתו מכוון הנהג את כיוון הרכב." },
  { term: "חגורת בטיחות", def: "רצועה המחברת את הנוסע למושב ומפחיתה פציעה בתאונה; שימוש בה חובה." },
  { term: "אזעקה", def: "מערכת אלקטרונית ברכב המתריעה בפני ניסיון פריצה או גניבה." },
  { term: "מסלול", def: "דרך מתוכננת מנקודת מוצא ליעד, כולל כל הפניות והכבישים שיש לעבור." },
  { term: "בלמים", def: "מערכת ההאטה של הרכב המאטה את גלגליו ומעצרת את תנועתו." },
  { term: "כיוון נסיעה", def: "הצד של הכביש שבו נוסעים — בישראל נוסעים בצד ימין." },
  { term: "אי-תנועה", def: "איזור מוגבה או מסומן באמצע הכביש המפריד בין כיווני נסיעה שונים." },
].sort((a, b) => a.term.localeCompare(b.term, "he"));

export default function GlossaryPage() {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim();
    if (!q) return TERMS;
    return TERMS.filter(
      ({ term, def }) => term.includes(q) || def.includes(q)
    );
  }, [query]);

  return (
    <PageShell>
      <SectionHead
        eyebrow="מילון מונחים"
        title="מילון מונחי נהיגה"
        subtitle={`${TERMS.length} מושגי יסוד שכדאי להכיר לפני המבחן — בעברית פשוטה ובלי עגה מקצועית.`}
      />

      <input
        type="search"
        inputMode="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="חיפוש מונח…"
        aria-label="חיפוש מונח"
        className="w-full h-11 px-4 rounded-[var(--th-radius-lg)] bg-[var(--th-card)] border border-[var(--th-border)] text-[var(--th-fg)] placeholder:text-[var(--th-muted-strong)] outline-none focus:border-[var(--th-accent)] transition-colors"
      />

      {filtered.length === 0 ? (
        <p className="w-full text-center py-12 text-[var(--th-muted-strong)]">
          לא נמצאו מונחים התואמים ל״{query}״.
        </p>
      ) : (
        <div className="grid sm:grid-cols-2 gap-3 w-full">
          {filtered.map(({ term, def }) => (
            <div
              key={term}
              className="flex flex-col gap-1.5 p-4 rounded-[var(--th-radius-lg)] bg-[var(--th-card)] border border-[var(--th-border)]"
            >
              <span className="font-bold text-[var(--th-fg)]">{term}</span>
              <span className="text-sm text-[var(--th-muted-strong)] leading-relaxed">
                {def}
              </span>
            </div>
          ))}
        </div>
      )}
    </PageShell>
  );
}
