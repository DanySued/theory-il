"use client";

import Link from "next/link";
import { useLang } from "@/lib/lang-context";
import { t } from "@/lib/i18n";

export default function NavBar() {
  const { locale, setLocale } = useLang();

  return (
    <header className="bg-[var(--th-card)] border-b border-[var(--th-border)] px-4 py-3 flex items-center justify-between gap-4">
      <Link href="/" className="font-bold text-lg tracking-tight text-[var(--th-fg)]">
        {t("nav.home", locale)}
      </Link>
      <nav className="flex items-center gap-1 text-sm">
        <Link
          href="/study"
          className="px-3 py-1.5 rounded-lg text-[var(--th-muted)] hover:text-[var(--th-fg)] hover:bg-[var(--th-muted-bg)] transition-colors"
        >
          {t("nav.study", locale)}
        </Link>
        <Link
          href="/exam"
          className="px-3 py-1.5 rounded-lg text-[var(--th-muted)] hover:text-[var(--th-fg)] hover:bg-[var(--th-muted-bg)] transition-colors"
        >
          {t("nav.exam", locale)}
        </Link>
        <Link
          href="/flashcards"
          className="px-3 py-1.5 rounded-lg text-[var(--th-muted)] hover:text-[var(--th-fg)] hover:bg-[var(--th-muted-bg)] transition-colors"
        >
          {t("nav.flashcards", locale)}
        </Link>
        <button
          onClick={() => setLocale(locale === "he" ? "en" : "he")}
          className="ms-2 px-2.5 py-1 rounded-lg border border-[var(--th-border)] text-xs font-bold hover:bg-[var(--th-muted-bg)] transition-colors"
          aria-label="Toggle language"
        >
          {locale === "he" ? "EN" : "עב"}
        </button>
      </nav>
    </header>
  );
}
