"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getDailyChallengeRecord, DAILY_DECK_SIZE } from "@/lib/dailyChallenge";
import { localDateStr } from "@/lib/utils";

type State =
  | { kind: "loading" }
  | { kind: "fresh" }
  | { kind: "done"; correctCount: number };

export default function DailyChallengeTile() {
  const [state, setState] = useState<State>({ kind: "loading" });

  useEffect(() => {
    const rec = getDailyChallengeRecord();
    const today = localDateStr(new Date());
    if (rec && rec.date === today) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setState({ kind: "done", correctCount: rec.correctCount });
    } else {
      setState({ kind: "fresh" });
    }
  }, []);

  if (state.kind === "loading") {
    return <div className="h-20 rounded-[var(--th-radius-lg)] bg-[var(--th-muted-bg)] animate-pulse" />;
  }

  const isDone = state.kind === "done";
  const eyebrow = isDone ? "אתגר יומי · הושלם" : "אתגר יומי";
  const title = isDone
    ? `${state.correctCount}/${DAILY_DECK_SIZE} נכון היום`
    : "3 שאלות · כדקה";
  const subtitle = isDone
    ? "נחזור מחר עם אתגר חדש."
    : "סבב יומי קצר שמתעדכן כל יום על בסיס החולשות שלך.";

  return (
    <Link
      href="/daily"
      className={`group w-full flex items-center gap-4 p-5 rounded-[var(--th-radius-lg)] bg-[var(--th-card)] border transition-all hover:-translate-y-0.5 hover:shadow-[var(--th-shadow-accent)] ${
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
  );
}
