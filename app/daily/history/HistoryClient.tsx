"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import PageShell from "@/components/PageShell";
import SectionHead from "@/components/SectionHead";
import Skeleton from "@/components/Skeleton";
import {
  getDailyHistory,
  getDailyStreak,
  DAILY_DECK_SIZE,
  type DailyHistoryEntry,
  type DailyStreak,
} from "@/lib/dailyChallenge";
import { localDateStr } from "@/lib/utils";

const VIEW_DAYS = 84; // 12 weeks

interface Day {
  date: string;
  correct: number | null; // null = no record
}

function buildGrid(history: DailyHistoryEntry[]): Day[] {
  const byDate = new Map(history.map((h) => [h.date, h.correctCount] as const));
  const today = new Date();
  // Anchor on the most recent Saturday for a 7×N column grid (Saturday is the start of the
  // Hebrew week, but the user reads the page RTL so Saturday-on-the-right makes sense).
  const days: Day[] = [];
  for (let i = VIEW_DAYS - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const key = localDateStr(d);
    const correct = byDate.has(key) ? byDate.get(key)! : null;
    days.push({ date: key, correct });
  }
  return days;
}

function intensityClass(correct: number | null): string {
  if (correct === null) return "bg-[var(--th-muted-bg)]";
  if (correct === 0) return "bg-[var(--th-error-soft)] border border-[var(--th-error)]/40";
  if (correct === DAILY_DECK_SIZE) return "bg-[var(--th-success)]";
  if (correct >= DAILY_DECK_SIZE - 1) return "bg-[var(--th-success)]/70";
  return "bg-[var(--th-accent)]/60";
}

export default function HistoryClient() {
  const [data, setData] = useState<{ history: DailyHistoryEntry[]; streak: DailyStreak } | null>(
    null
  );

  useEffect(() => {
    const history = getDailyHistory();
    const streak = getDailyStreak(history);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setData({ history, streak });
  }, []);

  if (!data) {
    return (
      <PageShell>
        <div className="w-full flex flex-col gap-6" aria-busy="true" aria-live="polite">
          <div className="w-full flex flex-col gap-3">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-9 w-56 max-w-full" />
            <Skeleton className="h-5 w-full max-w-md" />
          </div>
          <div className="flex gap-3">
            <Skeleton className="h-20 flex-1 rounded-[var(--th-radius-lg)]" />
            <Skeleton className="h-20 flex-1 rounded-[var(--th-radius-lg)]" />
          </div>
          <div className="flex flex-wrap gap-1.5">
            {Array.from({ length: 49 }).map((_, i) => (
              <Skeleton key={i} className="h-4 w-4 rounded-sm" />
            ))}
          </div>
        </div>
      </PageShell>
    );
  }

  const { history, streak } = data;
  const days = buildGrid(history);

  // Reshape into columns of 7 (one column per week)
  const weeks: Day[][] = [];
  for (let i = 0; i < days.length; i += 7) {
    weeks.push(days.slice(i, i + 7));
  }

  const recent = [...history].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 7);

  return (
    <PageShell>
      <SectionHead
        eyebrow="אתגר יומי · היסטוריה"
        title={`רצף ${streak.current} ${streak.current === 1 ? "יום" : "ימים"}`}
        subtitle={
          streak.totalDays === 0
            ? "עוד לא השלמת אתגר יומי. הסבב הראשון נמצא במרחק לחיצה."
            : `שיא של ${streak.best} ${streak.best === 1 ? "יום" : "ימים"} · ${streak.totalDays} ימי השלמה בסך הכל.`
        }
      />

      {/* Heat grid */}
      <div className="w-full overflow-x-auto">
        <div className="inline-flex flex-col gap-1.5 min-w-full" dir="ltr">
          {/* Weekday rows are visual; column = week, row = weekday */}
          <div className="flex gap-1.5">
            {weeks.map((week, wi) => (
              <div key={wi} className="flex flex-col gap-1.5">
                {week.map((day) => (
                  <div
                    key={day.date}
                    title={
                      day.correct !== null
                        ? `${day.date}: ${day.correct}/${DAILY_DECK_SIZE}`
                        : day.date
                    }
                    aria-label={
                      day.correct !== null
                        ? `${day.date}, ${day.correct} out of ${DAILY_DECK_SIZE}`
                        : `${day.date}, no entry`
                    }
                    className={`w-4 h-4 rounded-sm ${intensityClass(day.correct)}`}
                  />
                ))}
                {week.length < 7 &&
                  Array.from({ length: 7 - week.length }).map((_, i) => (
                    <div key={`pad-${i}`} className="w-4 h-4" />
                  ))}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-3 text-xs text-[var(--th-muted)]">
        <span>פחות</span>
        <div className="flex items-center gap-1">
          <span className="w-3 h-3 rounded-sm bg-[var(--th-muted-bg)]" />
          <span className="w-3 h-3 rounded-sm bg-[var(--th-error-soft)] border border-[var(--th-error)]/40" />
          <span className="w-3 h-3 rounded-sm bg-[var(--th-accent)]/60" />
          <span className="w-3 h-3 rounded-sm bg-[var(--th-success)]/70" />
          <span className="w-3 h-3 rounded-sm bg-[var(--th-success)]" />
        </div>
        <span>יותר</span>
      </div>

      {/* Recent list */}
      <section className="w-full flex flex-col gap-3">
        <h2 className="th-section-h">השבוע האחרון</h2>
        {recent.length === 0 ? (
          <p className="text-sm text-[var(--th-muted)]">אין נתונים עדיין.</p>
        ) : (
          <div className="flex flex-col gap-2">
            {recent.map((r) => (
              <div
                key={r.date}
                className="flex items-center justify-between gap-3 p-3 rounded-[var(--th-radius-lg)] border border-[var(--th-border)] bg-[var(--th-card)]"
              >
                <span className="text-sm text-[var(--th-muted-strong)] tabular-nums">{r.date}</span>
                <span className="text-sm font-semibold tabular-nums">
                  {r.correctCount}/{DAILY_DECK_SIZE}
                </span>
              </div>
            ))}
          </div>
        )}
      </section>

      <Link
        href="/daily"
        className="self-start inline-flex items-center justify-center h-11 px-5 rounded-[var(--th-radius-lg)] bg-[var(--th-accent)] text-white text-sm font-semibold hover:bg-[var(--th-accent-hover)] transition-colors"
      >
        אל האתגר של היום
      </Link>
    </PageShell>
  );
}
