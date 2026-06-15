"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getStreak } from "@/lib/storage";
import { isDailyCompletedToday } from "@/lib/dailyChallenge";

interface StreakState {
  current: number;
  needsDaily: boolean;
}

export default function NavStreakBadge() {
  const [state, setState] = useState<StreakState | null>(null);

  useEffect(() => {
    const streak = getStreak();
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setState({
      current: streak.current,
      needsDaily: !isDailyCompletedToday(),
    });
  }, []);

  // SSR + first paint: render a placeholder of the same width so the navbar layout
  // doesn't reflow once we read localStorage. Hides itself once we know there's nothing.
  if (state === null) {
    return <span className="hidden sm:inline-block w-[52px] h-7" aria-hidden />;
  }
  if (state.current === 0) return null;

  return (
    <Link
      href="/daily"
      aria-label={`רצף יומי: ${state.current} ${state.current === 1 ? "יום" : "ימים"}`}
      title={
        state.needsDaily
          ? `רצף ${state.current} ימים — אתגר היום עדיין מחכה`
          : `רצף ${state.current} ימים — האתגר של היום הושלם`
      }
      className={`shrink-0 inline-flex items-center gap-1 h-7 px-2.5 rounded-full text-xs font-bold tabular-nums transition-colors ${
        state.needsDaily
          ? "bg-[var(--th-accent-soft)] text-[var(--th-accent)] hover:bg-[var(--th-accent-soft)]/70"
          : "bg-[var(--th-muted-bg)] text-[var(--th-fg)] hover:bg-[var(--th-muted-bg)]/70"
      }`}
    >
      <span
        aria-hidden
        className={`leading-none text-sm ${state.needsDaily ? "animate-pulse" : ""}`}
      >
        🔥
      </span>
      <span>{state.current}</span>
    </Link>
  );
}
