"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Flame } from "lucide-react";
import { getStreak } from "@/lib/storage";
import { isDailyCompletedToday } from "@/lib/dailyChallengeStatus";

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
      // 44px tap area on phones around the 32px (28px on desktop) pill
      className="group shrink-0 inline-flex items-center h-11 sm:h-auto"
    >
      <span
        className={`inline-flex items-center gap-1 h-8 sm:h-7 px-2.5 rounded-full text-sm sm:text-xs font-bold tabular-nums transition-colors ${
          state.needsDaily
            ? "bg-[var(--th-accent-soft)] text-[var(--th-accent)] group-hover:bg-[var(--th-accent-soft)]/70"
            : "bg-[var(--th-muted-bg)] text-[var(--th-fg)] group-hover:bg-[var(--th-muted-bg)]/70"
        }`}
      >
        <Flame
          size={16}
          aria-hidden
          className={`shrink-0 ${state.needsDaily ? "motion-safe:animate-pulse" : ""}`}
        />
        <span>{state.current}</span>
      </span>
    </Link>
  );
}
