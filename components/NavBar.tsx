"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useRef, useEffect, useCallback } from "react";
import { Search, Settings, X } from "lucide-react";
import { searchQuestions } from "@/lib/search";
import type { Question } from "@/components/QuestionCard";
import { loadCorpus } from "@/lib/data/corpus";
import NavStreakBadge from "@/components/NavStreakBadge";
import ThemeToggle from "@/components/ThemeToggle";

const links = [
  { href: "/study", label: "לימוד" },
  { href: "/exam", label: "מבחן" },
  { href: "/flashcards", label: "כרטיסיות" },
  { href: "/review", label: "חזרה" },
  { href: "/progress", label: "התקדמות" },
];

// Real content from the app — topics, pages, sign categories
const SEARCH_SUGGESTIONS: { label: string; href: string; kind: string }[] = [
  { label: "חוקי התנועה", href: "/study/חוקי התנועה", kind: "נושא לימוד" },
  { label: "תמרורים", href: "/study/תמרורים", kind: "נושא לימוד" },
  { label: "בטיחות", href: "/study/בטיחות", kind: "נושא לימוד" },
  { label: "הכרת הרכב", href: "/study/הכרת הרכב", kind: "נושא לימוד" },
  { label: "מבחן תרגול", href: "/exam", kind: "עמוד" },
  { label: "כרטיסיות שינון", href: "/flashcards", kind: "עמוד" },
  { label: "כל הנושאים", href: "/study", kind: "עמוד" },
  { label: "התקדמות שלי", href: "/progress", kind: "עמוד" },
  { label: "שאלות שמורות", href: "/review?tab=saved", kind: "עמוד" },
  { label: "חזרה חכמה", href: "/review", kind: "עמוד" },
  { label: "הטעויות שלי", href: "/review?tab=mistakes", kind: "עמוד" },
  { label: "אתגר יומי", href: "/daily", kind: "עמוד" },
  { label: "היסטוריית אתגרים", href: "/daily/history", kind: "עמוד" },
  { label: "הגדרות", href: "/settings", kind: "עמוד" },
  { label: "גיבוי וייצוא", href: "/settings", kind: "עמוד" },
  { label: "תמרורי אזהרה", href: "/study/תמרורים", kind: "קטגוריית תמרורים" },
  { label: "תמרורי חובה", href: "/study/תמרורים", kind: "קטגוריית תמרורים" },
  { label: "תמרורי איסור", href: "/study/תמרורים", kind: "קטגוריית תמרורים" },
  { label: "תמרורי מידע", href: "/study/תמרורים", kind: "קטגוריית תמרורים" },
  { label: "סימוני כביש", href: "/study/תמרורים", kind: "קטגוריית תמרורים" },
];

const iconBtn =
  "shrink-0 inline-flex items-center justify-center w-11 h-11 rounded-[var(--th-radius)] text-[var(--th-muted-strong)] hover:text-[var(--th-fg)] hover:bg-[var(--th-muted-bg)] transition-colors";

export default function NavBar() {
  const pathname = usePathname();
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [corpus, setCorpus] = useState<Question[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const sheetInputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const ensureCorpus = useCallback(() => {
    if (corpus.length === 0) loadCorpus().then(setCorpus);
  }, [corpus.length]);

  const trimmedQuery = query.trim();

  const suggestionMatches = trimmedQuery.length > 0
    ? SEARCH_SUGGESTIONS.filter((s) => s.label.includes(trimmedQuery) || s.kind.includes(trimmedQuery))
    : [];

  // Search the real question corpus per keystroke; React Compiler handles memoization.
  const questionMatches = trimmedQuery.length >= 2 ? searchQuestions(corpus, trimmedQuery, 6) : [];

  // Unified suggestion list: pages first (fast routes), then live question matches.
  type Suggestion =
    | { kind: "suggestion"; label: string; href: string; meta: string }
    | { kind: "question"; label: string; href: string; meta: string };
  const filtered: Suggestion[] = [
    ...suggestionMatches.map((s) => ({ kind: "suggestion" as const, label: s.label, href: s.href, meta: s.kind })),
    ...questionMatches.map((r) => ({
      kind: "question" as const,
      label: r.question.text,
      href: `/q/${encodeURIComponent(r.question.id)}`,
      meta: r.question.topic,
    })),
  ];

  const closeSearch = useCallback(() => {
    setQuery("");
    setOpen(false);
    setMobileSearchOpen(false);
  }, []);

  const handleSelect = useCallback((href: string) => {
    router.push(href);
    closeSearch();
    inputRef.current?.blur();
  }, [router, closeSearch]);

  // Close the desktop dropdown on an outside tap/click (pointerdown works for touch too)
  useEffect(() => {
    const handler = (e: PointerEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("pointerdown", handler);
    return () => document.removeEventListener("pointerdown", handler);
  }, []);

  // Phone search sheet: lock the page behind it and close on Escape
  useEffect(() => {
    if (!mobileSearchOpen) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && closeSearch();
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [mobileSearchOpen, closeSearch]);

  const onInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Escape") closeSearch();
    if (e.key === "Enter" && filtered.length > 0) handleSelect(filtered[0].href);
  };

  const resultLabel = (s: Suggestion) => (
    <span
      className={
        s.kind === "question"
          ? "text-sm text-[var(--th-fg-soft)] line-clamp-2 leading-snug min-w-0"
          : "text-sm font-medium text-[var(--th-fg)]"
      }
    >
      {s.label}
    </span>
  );

  return (
    <>
      <header
        className="th-site-header sticky top-0 z-40 bg-[var(--th-bg)]/85 backdrop-blur-md border-b border-[var(--th-border)]"
        style={{ viewTransitionName: "site-header", paddingTop: "var(--th-safe-t)" }}
      >
        <div className="mx-auto max-w-6xl w-full ps-3 pe-2 sm:px-6 h-14 sm:h-[61px] flex items-center gap-1 sm:gap-3 sm:grid sm:grid-cols-[1fr_auto_1fr]">
          <Link
            href="/"
            className="group inline-flex items-center gap-2 text-[var(--th-fg)] shrink-0 min-h-11 px-1 sm:px-0"
          >
            <span className="text-[22px] sm:text-xl font-extrabold tracking-tight">תיאוריה</span>
          </Link>

          {/* Phone bar group: streak · search · settings (sections live in the bottom tab bar) */}
          <div className="sm:hidden ms-auto flex items-center gap-1 shrink-0">
            <NavStreakBadge />
            <button
              type="button"
              onClick={() => {
                ensureCorpus();
                setMobileSearchOpen(true);
                setTimeout(() => sheetInputRef.current?.focus(), 0);
              }}
              aria-label="חיפוש"
              aria-haspopup="dialog"
              className={iconBtn}
            >
              <Search size={22} aria-hidden />
            </button>
            <Link
              href="/settings"
              aria-label="הגדרות"
              aria-current={pathname === "/settings" ? "page" : undefined}
              className={iconBtn}
            >
              <Settings size={22} aria-hidden />
            </Link>
          </div>

          {/* Desktop inline search */}
          <div ref={containerRef} className="hidden sm:block sm:relative sm:w-64">
            <div className="flex items-center gap-1.5 h-8 px-2.5 rounded-[var(--th-radius-sm)] bg-[var(--th-muted-bg)] border border-[var(--th-border)] focus-within:border-[var(--th-accent)] transition-colors">
              <Search size={13} className="text-[var(--th-muted)] shrink-0" />
              <input
                ref={inputRef}
                type="search"
                placeholder="חיפוש…"
                dir="rtl"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setOpen(true);
                }}
                onFocus={() => { ensureCorpus(); setOpen(true); }}
                onKeyDown={onInputKeyDown}
                className="flex-1 bg-transparent text-base sm:text-sm text-[var(--th-fg)] placeholder:text-[var(--th-muted)] outline-none min-w-0"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => {
                    setQuery("");
                    setOpen(false);
                    inputRef.current?.focus();
                  }}
                  aria-label="נקה חיפוש"
                  className="shrink-0 text-[var(--th-muted)] hover:text-[var(--th-fg)] transition-colors"
                >
                  <X size={12} />
                </button>
              )}
            </div>

            {open && !mobileSearchOpen && filtered.length > 0 && (
              <ul
                role="listbox"
                className="absolute top-full mt-1 w-full bg-[var(--th-card)] border border-[var(--th-border)] rounded-[var(--th-radius)] shadow-lg overflow-hidden z-50 max-h-[60vh] overflow-y-auto"
              >
                {filtered.map((s, i) => (
                  <li key={i} role="option" aria-selected={false}>
                    <button
                      type="button"
                      onMouseDown={(e) => { e.preventDefault(); handleSelect(s.href); }}
                      className="w-full text-start px-3 py-2 flex items-center justify-between gap-3 hover:bg-[var(--th-muted-bg)] transition-colors"
                    >
                      {resultLabel(s)}
                      <span className="text-xs text-[var(--th-muted)] shrink-0">{s.meta}</span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <nav className="hidden sm:flex items-center gap-2 text-sm justify-end">
            <NavStreakBadge />
            <ThemeToggle />
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

      {/* Phone search: a full-screen sheet with a 16px input (no iOS focus zoom). It sits
          outside <header>: the header's backdrop-filter would trap position: fixed. */}
      {mobileSearchOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="חיפוש"
          className="sm:hidden fixed inset-0 z-50 flex flex-col bg-[var(--th-bg)]"
          style={{ paddingTop: "var(--th-safe-t)", paddingBottom: "var(--th-safe-b)" }}
        >
          <div className="h-14 shrink-0 flex items-center gap-1 ps-3 pe-1 border-b border-[var(--th-border)]">
            <div className="flex-1 flex items-center gap-2 h-11 px-3 rounded-[var(--th-radius)] bg-[var(--th-muted-bg)] border border-[var(--th-border)] focus-within:border-[var(--th-accent)]">
              <Search size={18} className="text-[var(--th-muted)] shrink-0" aria-hidden />
              <input
                ref={sheetInputRef}
                type="search"
                enterKeyHint="search"
                placeholder="חיפוש שאלה, נושא או עמוד…"
                aria-label="חיפוש"
                dir="rtl"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={onInputKeyDown}
                className="flex-1 bg-transparent text-base text-[var(--th-fg)] placeholder:text-[var(--th-muted)] outline-none min-w-0"
              />
            </div>
            <button type="button" onClick={closeSearch} aria-label="סגור חיפוש" className={iconBtn}>
              <X size={22} aria-hidden />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto overscroll-contain">
            {trimmedQuery.length === 0 ? (
              <p className="px-4 py-6 text-sm text-[var(--th-muted)]">
                חפשו נושא, סוג תמרור או מילה מתוך שאלה.
              </p>
            ) : filtered.length === 0 ? (
              <p className="px-4 py-6 text-sm text-[var(--th-muted)]">
                {trimmedQuery.length >= 2 && corpus.length === 0 ? "מחפש…" : "לא נמצאו תוצאות."}
              </p>
            ) : (
              <ul role="listbox" aria-label="תוצאות חיפוש" className="py-1">
                {filtered.map((s, i) => (
                  <li key={i} role="option" aria-selected={false}>
                    <button
                      type="button"
                      onClick={() => handleSelect(s.href)}
                      className="w-full min-h-12 text-start px-4 py-2.5 flex items-center justify-between gap-3 border-b border-[var(--th-border)] active:bg-[var(--th-muted-bg)]"
                    >
                      {resultLabel(s)}
                      <span className="text-xs text-[var(--th-muted)] shrink-0">{s.meta}</span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </>
  );
}
