"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useRef, useEffect, useCallback } from "react";
import { Search, X } from "lucide-react";
import questionsData from "@/lib/data/questions.json";
import { searchQuestions } from "@/lib/search";
import type { Question } from "@/components/QuestionCard";

const allQuestions = questionsData as Question[];

const links = [
  { href: "/study", label: "לימוד" },
  { href: "/exam", label: "מבחן" },
  { href: "/flashcards", label: "כרטיסיות" },
  { href: "/saved", label: "שמורות" },
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
  { label: "שאלות שמורות", href: "/saved", kind: "עמוד" },
  { label: "חזרה חכמה", href: "/review", kind: "עמוד" },
  { label: "אתגר יומי", href: "/daily", kind: "עמוד" },
  { label: "הגדרות", href: "/settings", kind: "עמוד" },
  { label: "גיבוי וייצוא", href: "/settings", kind: "עמוד" },
  { label: "תמרורי אזהרה", href: "/study/תמרורים", kind: "קטגוריית תמרורים" },
  { label: "תמרורי חובה", href: "/study/תמרורים", kind: "קטגוריית תמרורים" },
  { label: "תמרורי איסור", href: "/study/תמרורים", kind: "קטגוריית תמרורים" },
  { label: "תמרורי מידע", href: "/study/תמרורים", kind: "קטגוריית תמרורים" },
  { label: "סימוני כביש", href: "/study/תמרורים", kind: "קטגוריית תמרורים" },
];

export default function NavBar() {
  const pathname = usePathname();
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const trimmedQuery = query.trim();

  const suggestionMatches = trimmedQuery.length > 0
    ? SEARCH_SUGGESTIONS.filter((s) => s.label.includes(trimmedQuery) || s.kind.includes(trimmedQuery))
    : [];

  // Search the real question corpus per keystroke; React Compiler handles memoization.
  const questionMatches = trimmedQuery.length >= 2 ? searchQuestions(allQuestions, trimmedQuery, 6) : [];

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

  const handleSelect = useCallback((href: string) => {
    router.push(href);
    setQuery("");
    setOpen(false);
    setMobileSearchOpen(false);
    inputRef.current?.blur();
  }, [router]);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
        setMobileSearchOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <header className="sticky top-0 z-40 bg-[var(--th-bg)]/85 backdrop-blur-md border-b border-[var(--th-border)]">
      <div className="mx-auto max-w-6xl w-full px-4 sm:px-6 h-[61px] flex items-center gap-3 sm:grid sm:grid-cols-[1fr_auto_1fr]">
        <Link
          href="/"
          className="group inline-flex items-baseline gap-2 text-[var(--th-fg)] shrink-0"
        >
          <span className="text-xl font-extrabold tracking-tight">תיאוריה</span>
        </Link>

        {/* Mobile search toggle */}
        <button
          type="button"
          onClick={() => {
            setMobileSearchOpen(true);
            setTimeout(() => inputRef.current?.focus(), 0);
          }}
          aria-label="חיפוש"
          className="sm:hidden ms-auto shrink-0 inline-flex items-center justify-center w-9 h-9 rounded-[var(--th-radius-sm)] text-[var(--th-muted)] hover:text-[var(--th-fg)] hover:bg-[var(--th-muted-bg)] transition-colors"
        >
          <Search size={16} />
        </button>

        {/* Search (desktop inline, mobile overlay) */}
        <div
          ref={containerRef}
          className={`${
            mobileSearchOpen
              ? "absolute inset-x-3 top-2 z-50"
              : "hidden sm:block sm:relative sm:w-64"
          }`}
        >
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
              onFocus={() => setOpen(true)}
              onKeyDown={(e) => {
                if (e.key === "Escape") { setOpen(false); setQuery(""); setMobileSearchOpen(false); }
                if (e.key === "Enter" && filtered.length > 0) handleSelect(filtered[0].href);
              }}
              className="flex-1 bg-transparent text-sm text-[var(--th-fg)] placeholder:text-[var(--th-muted)] outline-none min-w-0"
            />
            {(query || mobileSearchOpen) && (
              <button
                type="button"
                onClick={() => {
                  setQuery("");
                  setOpen(false);
                  if (mobileSearchOpen) {
                    setMobileSearchOpen(false);
                  } else {
                    inputRef.current?.focus();
                  }
                }}
                aria-label="סגור חיפוש"
                className="shrink-0 text-[var(--th-muted)] hover:text-[var(--th-fg)] transition-colors"
              >
                <X size={12} />
              </button>
            )}
          </div>

          {open && filtered.length > 0 && (
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
                    <span
                      className={
                        s.kind === "question"
                          ? "text-sm text-[var(--th-fg-soft)] line-clamp-2 leading-snug min-w-0"
                          : "text-sm font-medium text-[var(--th-fg)]"
                      }
                    >
                      {s.label}
                    </span>
                    <span className="text-xs text-[var(--th-muted)] shrink-0">{s.meta}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <nav className="flex items-center gap-1 text-sm justify-end">
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
