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
          הגעת למקום הנכון :)
          <br />
          לעבור תיאוריה זה לא כזה פשוט. אבל אנחנו פה בשבילך
        </p>

        <StreakBadge />

        <div className="th-rule w-full" />

        <div className="flex flex-col items-center gap-4 w-full">
          <Link
            href="/study"
            className="inline-flex items-center justify-center h-14 w-full max-w-xs rounded-xl bg-[var(--th-accent)] text-white text-base font-semibold shadow-sm hover:bg-[var(--th-accent-hover)] hover:shadow-md transition-all"
          >
            התחל ללמוד
            <span aria-hidden className="mr-2">←</span>
          </Link>

          <div className="grid grid-cols-2 gap-3 w-full max-w-xs">
            <Link
              href="/exam"
              className="flex flex-col items-center gap-1.5 px-4 py-4 rounded-xl border border-[var(--th-border)] bg-[var(--th-card)] hover:border-[var(--th-accent)] hover:shadow-sm transition-all text-center"
            >
              <span className="text-2xl" aria-hidden>📋</span>
              <span className="text-sm font-semibold text-[var(--th-fg)]">מבחן מדומה</span>
              <span className="text-xs text-[var(--th-muted)]">30 שאלות · 40 דק׳</span>
            </Link>
            <Link
              href="/flashcards"
              className="flex flex-col items-center gap-1.5 px-4 py-4 rounded-xl border border-[var(--th-border)] bg-[var(--th-card)] hover:border-[var(--th-accent)] hover:shadow-sm transition-all text-center"
            >
              <span className="text-2xl" aria-hidden>🗂️</span>
              <span className="text-sm font-semibold text-[var(--th-fg)]">כרטיסיות</span>
              <span className="text-xs text-[var(--th-muted)]">חזרה מרווחת SRS</span>
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
