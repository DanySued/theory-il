import Link from "next/link";

export default function Home() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center px-6 py-24 text-center">
      <div className="max-w-xl">
        <h1 className="text-4xl font-bold tracking-tight mb-4">
          מתכוננים לתיאוריה?
        </h1>
        <p className="text-lg text-[var(--th-muted)] mb-10 leading-relaxed">
          לומדים עם שאלות מהמאגר הרשמי של משרד התחבורה.
          <br />
          מצב לימוד, מבחן מדומה ובדיקת תשובות — הכל במקום אחד.
        </p>
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
        </div>
        <p className="mt-16 text-sm text-[var(--th-muted)]">
          בקרוב — האתר בבנייה
        </p>
      </div>
    </main>
  );
}
