import Link from "next/link";

export default function NavBar() {
  return (
    <header className="bg-[var(--th-card)] border-b border-[var(--th-border)] px-4 py-3 flex items-center justify-between gap-4">
      <Link href="/" className="font-bold text-lg tracking-tight text-[var(--th-fg)]">
        תיאוריה
      </Link>
      <nav className="flex items-center gap-1 text-sm">
        <Link
          href="/study"
          className="px-3 py-1.5 rounded-lg text-[var(--th-muted)] hover:text-[var(--th-fg)] hover:bg-[var(--th-muted-bg)] transition-colors"
        >
          לימוד
        </Link>
        <Link
          href="/exam"
          className="px-3 py-1.5 rounded-lg text-[var(--th-muted)] hover:text-[var(--th-fg)] hover:bg-[var(--th-muted-bg)] transition-colors"
        >
          מבחן
        </Link>
        <Link
          href="/flashcards"
          className="px-3 py-1.5 rounded-lg text-[var(--th-muted)] hover:text-[var(--th-fg)] hover:bg-[var(--th-muted-bg)] transition-colors"
        >
          כרטיסיות
        </Link>
      </nav>
    </header>
  );
}
