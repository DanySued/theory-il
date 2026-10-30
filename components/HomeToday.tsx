"use client";

import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { useReturningState } from "@/components/ReturningHero";
import { focusBase } from "@/components/FocusActionBar";
import { formatChance } from "@/lib/readiness";
import { TOPIC_COUNTS } from "@/lib/data/topics";

const primaryBtn = `${focusBase} text-[17px] bg-[var(--th-accent)] text-[var(--th-on-accent)] active:bg-[var(--th-accent-hover)]`;
const card =
  "rounded-[20px] border border-[var(--th-border)] bg-[var(--th-card)] p-4 flex flex-col gap-3 shadow-[var(--th-shadow-md)]";

/** First visit (no study data): one clear way in. Hidden by CSS for returning learners. */
export function HomeStartCard() {
  return (
    <section aria-label="מתחילים" className={`th-new-only ${card}`}>
      <div className="flex flex-col gap-0.5">
        <span className="text-[13px] text-[var(--th-muted-strong)]">הגעת למקום הנכון :)</span>
        <span className="text-xl font-extrabold">בוא נתחיל בתמרורים</span>
        <span className="text-sm text-[var(--th-muted-strong)]">
          {TOPIC_COUNTS["תמרורים"]} שאלות מהמאגר הרשמי, עם משוב מיידי על כל תשובה
        </span>
      </div>
      <Link href="/study/תמרורים?view=drill" className={primaryBtn}>
        בוא נתחיל
        <ChevronLeft size={20} strokeWidth={2.2} aria-hidden />
      </Link>
      <Link
        href="/study"
        className="self-center min-h-11 inline-flex items-center text-sm text-[var(--th-muted-strong)] underline underline-offset-4"
      >
        רוצה להתחיל בנושא אחר?
      </Link>
    </section>
  );
}

/**
 * Returning learner, phones: "continue where you stopped" plus two stat tiles. Built on
 * ReturningHero's state, and it only ever shows numbers that come from real local data.
 */
export function HomeContinueCard({ topicIndex }: { topicIndex: Record<string, number> }) {
  const state = useReturningState(topicIndex);

  if (!state) {
    return (
      <div className="th-returning-only flex flex-col gap-3" aria-busy="true">
        <div className="h-[168px] rounded-[20px] bg-[var(--th-muted-bg)] animate-pulse" />
      </div>
    );
  }

  const { resume, r, dueToday } = state;
  const tiles = [
    r.enoughData
      ? { label: "סיכוי לעבור", value: formatChance(r.passChance), href: "/progress" }
      : r.seen > 0
        ? { label: "שאלות שענית", value: String(r.seen), href: "/progress" }
        : null,
    dueToday > 0 ? { label: "לחזרה היום", value: String(dueToday), href: "/flashcards" } : null,
  ].filter((t): t is { label: string; value: string; href: string } => t !== null);

  return (
    <div className="th-returning-only flex flex-col gap-3">
      <section aria-label="המשך לימוד" className={card} aria-live="polite">
        {resume ? (
          <>
            <div className="flex items-center justify-between gap-2">
              <div className="flex flex-col gap-0.5 min-w-0">
                <span className="text-[13px] text-[var(--th-muted-strong)]">{resume.eyebrow}</span>
                <span className="text-xl font-extrabold truncate">{resume.title}</span>
              </div>
              {resume.position ? (
                <span className="shrink-0 text-sm font-semibold text-[var(--th-muted-strong)] tabular-nums" dir="ltr">
                  {resume.position.current} / {resume.position.total}
                </span>
              ) : (
                <span className="shrink-0 text-sm font-semibold text-[var(--th-muted-strong)]">{resume.meta}</span>
              )}
            </div>
            {resume.position && (
              <div className="h-1.5 rounded-full bg-[var(--th-muted-bg)] overflow-hidden" aria-hidden>
                <div
                  className="h-full rounded-full bg-[var(--th-accent)]"
                  style={{ width: `${(resume.position.current / resume.position.total) * 100}%` }}
                />
              </div>
            )}
            <Link href={resume.href} className={primaryBtn}>
              {resume.kind === "drill" ? "המשך תרגול" : "לסקירת המבחן"}
              <ChevronLeft size={20} strokeWidth={2.2} aria-hidden />
            </Link>
          </>
        ) : (
          <>
            <div className="flex flex-col gap-0.5">
              <span className="text-[13px] text-[var(--th-muted-strong)]">ממשיכים מאיפה שהפסקת</span>
              <span className="text-xl font-extrabold">חזרה חכמה</span>
              <span className="text-sm text-[var(--th-muted-strong)]">סבב של 20 שאלות שבחרנו לפי הנתונים שלך</span>
            </div>
            <Link href="/review" className={primaryBtn}>
              התחל סבב
              <ChevronLeft size={20} strokeWidth={2.2} aria-hidden />
            </Link>
          </>
        )}
      </section>

      {tiles.length > 0 && (
        <div className="grid grid-cols-2 gap-3">
          {tiles.map((t) => (
            <Link
              key={t.label}
              href={t.href}
              className={`${tiles.length === 1 ? "col-span-2" : ""} rounded-2xl border border-[var(--th-border)] bg-[var(--th-card)] px-3.5 py-3 flex flex-col gap-0.5 active:bg-[var(--th-muted-bg)]`}
            >
              <span className="text-[13px] text-[var(--th-muted-strong)]">{t.label}</span>
              <span className="text-[26px] leading-tight font-extrabold tabular-nums">{t.value}</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
