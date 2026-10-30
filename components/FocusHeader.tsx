"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { ChevronRight, X } from "lucide-react";

export const focusIconBtn =
  "shrink-0 inline-flex items-center justify-center w-11 h-11 rounded-[var(--th-radius)] text-[var(--th-fg)] active:bg-[var(--th-muted-bg)] transition-colors";

interface Props {
  /** Leading button: a link back, or a handler (e.g. "exit exam?" confirm). */
  back: { label: string; href?: string; onClick?: () => void; icon?: "back" | "close" };
  title?: ReactNode;
  subtitle?: ReactNode;
  /** Replaces the title block (the exam's centered timer). */
  center?: ReactNode;
  trailing?: ReactNode;
  /** 0..1 — draws the 3px progress line under the bar. */
  progress?: number;
  /** Bleed through the page gutter (when rendered inside a padded container). */
  bleed?: boolean;
}

/**
 * Phone-only top bar for focus screens (drill, exam, flashcards). Desktop keeps each
 * screen's own header, so this renders nothing visible at ≥640px. Its marker span is
 * what globals.css keys focus mode on (`body:has(.th-focus-marker)`): the global header
 * and tab bar step aside, straight from the server HTML, so nothing flashes on load.
 */
export default function FocusHeader({ back, title, subtitle, center, trailing, progress, bleed = false }: Props) {
  const BackIcon = back.icon === "close" ? X : ChevronRight; // RTL: "back" points right
  const backInner = <BackIcon size={back.icon === "close" ? 22 : 24} aria-hidden />;

  return (
    <header
      className={`sm:hidden sticky top-0 z-40 self-stretch ${bleed ? "-mx-[var(--th-page-px)]" : ""} bg-[var(--th-bg)]/90 backdrop-blur-md border-b border-[var(--th-border)]`}
      style={{ paddingTop: "var(--th-safe-t)" }}
    >
      <span className="th-focus-marker" hidden />
      <div className="h-14 px-1 flex items-center gap-1">
        {back.href ? (
          <Link href={back.href} aria-label={back.label} className={focusIconBtn}>
            {backInner}
          </Link>
        ) : (
          <button type="button" onClick={back.onClick} aria-label={back.label} className={focusIconBtn}>
            {backInner}
          </button>
        )}
        {center ?? (
          <div className="flex-1 min-w-0 flex flex-col leading-tight">
            <span className="text-[17px] font-extrabold truncate">{title}</span>
            {subtitle && <span className="text-xs text-[var(--th-muted-strong)] truncate">{subtitle}</span>}
          </div>
        )}
        {trailing}
      </div>
      {progress !== undefined && (
        <div className="h-[3px] bg-[var(--th-muted-bg)]" aria-hidden>
          <div
            className="h-full bg-[var(--th-accent)] transition-[width] duration-300 ease-out"
            style={{ width: `${Math.max(0, Math.min(1, progress)) * 100}%` }}
          />
        </div>
      )}
    </header>
  );
}
