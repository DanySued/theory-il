"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Check, ChevronLeft, Zap } from "lucide-react";
import {
  getDailyChallengeRecord,
  getDailyStreak,
  DAILY_DECK_SIZE,
} from "@/lib/dailyChallenge";
import { localDateStr } from "@/lib/utils";

type State =
  | { kind: "loading" }
  | { kind: "fresh"; streak: number }
  | { kind: "done"; correctCount: number; streak: number };

export default function DailyChallengeTile() {
  const [state, setState] = useState<State>({ kind: "loading" });

  useEffect(() => {
    const rec = getDailyChallengeRecord();
    const today = localDateStr(new Date());
    const streakInfo = getDailyStreak();
    if (rec && rec.date === today) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setState({ kind: "done", correctCount: rec.correctCount, streak: streakInfo.current });
    } else {
      setState({ kind: "fresh", streak: streakInfo.current });
    }
  }, []);

  if (state.kind === "loading") {
    return <div className="h-[60px] sm:h-20 rounded-2xl sm:rounded-[var(--th-radius-lg)] bg-[var(--th-muted-bg)] animate-pulse" />;
  }

  const isDone = state.kind === "done";
  const eyebrow = isDone ? "אתגר יומי · הושלם" : "אתגר יומי";
  const title = isDone
    ? `${state.correctCount}/${DAILY_DECK_SIZE} נכון היום`
    : "3 שאלות · כדקה";

  let subtitle: string;
  if (isDone) {
    subtitle =
      state.streak > 1
        ? `🔥 רצף ${state.streak} ימים — אל תשבור אותו מחר.`
        : "התחלת רצף — נחזור מחר.";
  } else if (state.streak >= 1) {
    subtitle = `🔥 רצף ${state.streak} ${state.streak === 1 ? "יום" : "ימים"} — אל תפספס היום.`;
  } else {
    subtitle = "סבב יומי קצר שמתעדכן כל יום על בסיס החולשות שלך.";
  }

  // Phones: a compact 60px row (accent-soft fill, 36px icon) per the iPhone design.
  const compactSub = isDone
    ? state.streak > 1
      ? `רצף ${state.streak} ימים · נחזור מחר`
      : "הושלם · נחזור מחר"
    : `${DAILY_DECK_SIZE} שאלות · כדקה`;

  return (
    <>
      <Link
        href="/daily"
        className={`sm:hidden w-full min-h-[60px] flex items-center gap-3 px-3.5 py-2.5 rounded-2xl active:opacity-80 ${
          isDone ? "bg-[var(--th-success-soft)]" : "bg-[var(--th-accent-soft)]"
        }`}
      >
        <span
          aria-hidden
          className={`shrink-0 inline-flex items-center justify-center w-9 h-9 rounded-[10px] ${
            isDone ? "bg-[var(--th-success)] text-[var(--th-on-accent)]" : "bg-[var(--th-accent)] text-[var(--th-on-accent)]"
          }`}
        >
          {isDone ? <Check size={18} strokeWidth={2.5} /> : <Zap size={18} />}
        </span>
        <span className="flex flex-col flex-1 min-w-0">
          <span className="text-base font-bold text-[var(--th-fg)]">
            {isDone ? `אתגר יומי · ${state.correctCount}/${DAILY_DECK_SIZE} נכון` : "אתגר יומי"}
          </span>
          <span className="text-[13px] text-[var(--th-muted-strong)] truncate">{compactSub}</span>
        </span>
        <ChevronLeft size={20} aria-hidden className={isDone ? "text-[var(--th-success)]" : "text-[var(--th-accent)]"} />
      </Link>
      <Link
        href="/daily"
        className={`group w-full hidden sm:flex items-center gap-4 p-5 rounded-[var(--th-radius-lg)] bg-[var(--th-card)] border transition-all hover:-translate-y-0.5 hover:shadow-[var(--th-shadow-accent)] ${
          isDone
            ? "border-[var(--th-success)] hover:border-[var(--th-success)]"
            : "border-[var(--th-border)] hover:border-[var(--th-accent)]"
        }`}
      >
        <span
          aria-hidden
          className={`shrink-0 inline-flex items-center justify-center w-11 h-11 rounded-full text-lg font-bold ${
            isDone
              ? "bg-[var(--th-success-soft)] text-[var(--th-success)]"
              : "bg-[var(--th-accent-soft)] text-[var(--th-accent)]"
          }`}
        >
          {isDone ? "✓" : "✦"}
        </span>
        <div className="flex flex-col gap-1 min-w-0 flex-1">
          <span className="th-eyebrow">{eyebrow}</span>
          <span className="text-lg font-extrabold tracking-tight text-[var(--th-fg)] truncate">
            {title}
          </span>
          <span className="text-sm text-[var(--th-muted)] truncate">{subtitle}</span>
        </div>
        <span
          aria-hidden
          className="shrink-0 text-[var(--th-muted)] group-hover:text-[var(--th-accent)] group-hover:-translate-x-1 transition-all text-xl"
        >
          ←
        </span>
      </Link>
    </>
  );
}
