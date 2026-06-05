"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/study", label: "לימוד" },
  { href: "/exam", label: "מבחן" },
  { href: "/flashcards", label: "כרטיסיות" },
];

export default function NavBar() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 bg-[var(--th-bg)]/85 backdrop-blur-md border-b border-[var(--th-border)]">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 h-14 flex items-center justify-between">
        <Link
          href="/"
          className="group inline-flex items-baseline gap-2 text-[var(--th-fg)]"
        >
          <span className="text-xl font-extrabold tracking-tight">תיאוריה</span>
        </Link>
        <nav className="flex items-center gap-1 text-sm">
          {links.map((l) => {
            const active =
              pathname === l.href || pathname.startsWith(l.href + "/");
            return (
              <Link
                key={l.href}
                href={l.href}
                aria-current={active ? "page" : undefined}
                className={`relative px-3 py-1.5 transition-colors ${
                  active
                    ? "font-extrabold text-[var(--th-fg)]"
                    : "font-medium text-[var(--th-muted-strong)] hover:text-[var(--th-fg)]"
                }`}
              >
                {l.label}
                {active && (
                  <span className="absolute bottom-0 inset-x-3 h-0.5 rounded-full bg-[var(--th-accent)]" />
                )}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
