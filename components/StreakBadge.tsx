"use client";

import { useEffect, useState, useRef } from "react";
import { motion } from "motion/react";
import { getStreak, type StreakData } from "@/lib/storage";

export default function StreakBadge() {
  const [streak, setStreak] = useState<StreakData | null>(null);
  const [displayCount, setDisplayCount] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const data = getStreak();
    setStreak(data);
    if (data && data.current > 0) {
      const start = Math.max(1, data.current - 3);
      setDisplayCount(start);
      if (start < data.current) {
        let n = start;
        timerRef.current = setInterval(() => {
          n++;
          setDisplayCount(n);
          if (n >= data.current) clearInterval(timerRef.current!);
        }, 80);
      } else {
        setDisplayCount(data.current);
      }
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  if (!streak || streak.current === 0) return null;

  return (
    <motion.div
      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[var(--th-muted-bg)] border border-[var(--th-border)] text-sm"
      initial={{ y: 12, opacity: 0, scale: 0.85 }}
      animate={{ y: 0, opacity: 1, scale: 1 }}
      transition={{ type: "spring", stiffness: 200, damping: 28 }}
    >
      <span>🔥</span>
      <span className="font-bold tabular-nums">{displayCount}</span>
      <span className="text-[var(--th-muted)]">
        {streak.current === 1 ? "יום" : "ימים"} רצופים
      </span>
    </motion.div>
  );
}
