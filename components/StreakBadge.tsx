"use client";

import { useEffect, useState } from "react";
import { updateStreak, type StreakData } from "@/lib/storage";

export default function StreakBadge() {
  const [streak, setStreak] = useState<StreakData | null>(null);

  useEffect(() => {
    setStreak(updateStreak());
  }, []);

  if (!streak || streak.current === 0) return null;

  return (
    <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[var(--th-muted-bg)] border border-[var(--th-border)] text-sm">
      <span>🔥</span>
      <span className="font-bold tabular-nums">{streak.current}</span>
      <span className="text-[var(--th-muted)]">
        {streak.current === 1 ? "יום" : "ימים"} רצופים
      </span>
    </div>
  );
}
