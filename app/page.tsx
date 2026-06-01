import Link from "next/link";
import StreakBadge from "@/components/StreakBadge";

export default function Home() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center px-6 py-16 text-center">
      <div className="max-w-xl flex flex-col items-center gap-6">
        <h1 className="text-4xl font-bold tracking-tight">
          מתכוננים לתיאוריה?
        </h1>
        <p className="text-lg text-[var(--th-muted)] leading-relaxed">
          לומדים עם שאלות מהמאגר הרשמי של משרד התחבורה.
          <br />
          מצב לימוד, מבחן מדומה ובדיקת תשובות — הכל במקום אחד.
        </p>

        <StreakBadge />

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/study"
            className="inline-flex items-center justify-center h-12 px-8 rounded-xl bg-[var(--th-accent)] text-white font-semibold hover:bg-[var(--th-accent-hover)] transition-colors"
          >
            התחל ללמוד
          </Link>
          <Link
            href="/exam"
            className="inline-flex items-center justify-center h-12 px-8 rounded-xl border border-[var(--th-border)] font-semibold hover:bg-[var(--th-muted-bg)] transition-colors"
          >
            מבחן מדומה
          </Link>
          <Link
            href="/flashcards"
            className="inline-flex items-center justify-center h-12 px-8 rounded-xl border border-[var(--th-border)] font-semibold hover:bg-[var(--th-muted-bg)] transition-colors"
          >
            כרטיסיות
          </Link>
        </div>

        <p className="mt-8 text-xs text-[var(--th-muted)]">
          שאלות: משרד התחבורה והבטיחות בדרכים, data.gov.il, רישיון CC-BY
        </p>
      </div>
    </main>
  );
}
