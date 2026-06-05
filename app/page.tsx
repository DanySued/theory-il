import Link from "next/link";
import StreakBadge from "@/components/StreakBadge";

export default function Home() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center px-6 py-20">
      <div className="w-full max-w-2xl flex flex-col items-center text-center gap-8">
        <h1 className="th-display text-[var(--th-fg)]">
          מתכוננים
          <br />
          <span className="text-[var(--th-accent)]">לתיאוריה</span>
        </h1>

        <p className="text-lg text-[var(--th-muted-strong)] leading-relaxed max-w-md">
          לימוד לפי נושאים, מבחן מדומה וכרטיסיות חזרה —
          <br />
          הכל מתוך השאלות הרשמיות.
        </p>

        <StreakBadge />

        <div className="flex flex-col items-center gap-4 w-full pt-2">
          <Link
            href="/study"
            className="inline-flex items-center justify-center h-14 px-10 rounded-xl bg-[var(--th-accent)] text-white text-base font-semibold shadow-sm hover:bg-[var(--th-accent-hover)] hover:shadow-md transition-all"
          >
            התחל ללמוד
            <span aria-hidden className="mr-2 transition-transform group-hover:-translate-x-1">←</span>
          </Link>

          <div className="flex items-center gap-1 text-sm text-[var(--th-muted-strong)]">
            <Link
              href="/exam"
              className="px-3 py-1.5 rounded-md hover:bg-[var(--th-muted-bg)] hover:text-[var(--th-fg)] transition-colors"
            >
              מבחן מדומה
            </Link>
            <span aria-hidden className="text-[var(--th-border-strong)]">·</span>
            <Link
              href="/flashcards"
              className="px-3 py-1.5 rounded-md hover:bg-[var(--th-muted-bg)] hover:text-[var(--th-fg)] transition-colors"
            >
              כרטיסיות
            </Link>
          </div>
        </div>

        <div className="th-rule w-32 mt-8" />

        <p className="text-xs text-[var(--th-muted)] tracking-wide">
          שאלות: משרד התחבורה והבטיחות בדרכים · data.gov.il · CC-BY
        </p>
      </div>
    </main>
  );
}
