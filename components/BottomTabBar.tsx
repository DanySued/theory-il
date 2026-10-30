"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, BookOpen, Home, RotateCcw, Timer, type LucideIcon } from "lucide-react";

interface Tab {
  href: string;
  label: string;
  Icon: LucideIcon;
  /** Path prefixes that light this tab up (exact match for "/"). */
  match: string[];
}

const TABS: Tab[] = [
  { href: "/", label: "בית", Icon: Home, match: [] },
  { href: "/study", label: "לימוד", Icon: BookOpen, match: ["/study", "/flashcards"] },
  { href: "/exam", label: "מבחן", Icon: Timer, match: ["/exam", "/results"] },
  { href: "/review", label: "חזרה", Icon: RotateCcw, match: ["/review", "/daily", "/saved", "/mistakes"] },
  { href: "/progress", label: "התקדמות", Icon: BarChart3, match: ["/progress", "/settings"] },
];

function isActive(tab: Tab, pathname: string): boolean {
  if (tab.href === "/") return pathname === "/";
  return tab.match.some((m) => pathname === m || pathname.startsWith(m + "/"));
}

/** Phone-only primary navigation. Hidden on focus screens (see FocusMode + globals.css). */
export default function BottomTabBar() {
  const pathname = decodeURI(usePathname() ?? "/");

  return (
    <nav
      aria-label="ניווט ראשי"
      className="th-tabbar sm:hidden fixed inset-x-0 bottom-0 z-40 border-t border-[var(--th-border)] bg-[var(--th-card)]/95 backdrop-blur-md"
      style={{ paddingBottom: "var(--th-safe-b)", viewTransitionName: "tabbar" }}
    >
      <ul className="grid grid-cols-5 px-1 pt-1.5">
        {TABS.map((tab) => {
          const active = isActive(tab, pathname);
          return (
            <li key={tab.href}>
              <Link
                href={tab.href}
                prefetch
                aria-current={active ? "page" : undefined}
                className={`h-[50px] flex flex-col items-center justify-center gap-[3px] rounded-[var(--th-radius)] text-[11px] leading-none transition-colors ${
                  active
                    ? "font-bold text-[var(--th-accent)]"
                    : "font-medium text-[var(--th-muted-strong)]"
                }`}
              >
                <tab.Icon size={24} strokeWidth={2} aria-hidden />
                {tab.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
