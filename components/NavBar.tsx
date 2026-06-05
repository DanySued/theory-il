import Link from "next/link";

const links = [
  { href: "/study", label: "לימוד" },
  { href: "/exam", label: "מבחן" },
  { href: "/flashcards", label: "כרטיסיות" },
];

export default function NavBar() {
  return (
    <header className="sticky top-0 z-40 bg-[var(--th-bg)]/85 backdrop-blur-md border-b border-[var(--th-border)]">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 h-14 flex items-center justify-between">
        <Link
          href="/"
          className="group inline-flex items-baseline gap-2 text-[var(--th-fg)]"
        >
          <span className="text-lg font-extrabold tracking-tight">תיאוריה</span>
          <span
            aria-hidden
            className="h-1.5 w-1.5 rounded-full bg-[var(--th-accent)] translate-y-[-2px] transition-transform group-hover:scale-125"
          />
        </Link>
        <nav className="flex items-center gap-1 text-sm">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="px-3 py-1.5 rounded-md font-medium text-[var(--th-muted-strong)] hover:text-[var(--th-fg)] hover:bg-[var(--th-muted-bg)] transition-colors"
            >
              {l.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
