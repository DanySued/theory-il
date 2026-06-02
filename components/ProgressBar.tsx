"use client";

import { motion } from "motion/react";

interface ProgressBarProps {
  current: number;
  total: number;
  className?: string;
}

export default function ProgressBar({ current, total, className = "" }: ProgressBarProps) {
  const pct = total > 0 ? Math.round((current / total) * 100) : 0;

  return (
    <div
      className={`w-full h-2 bg-[var(--th-muted-bg)] rounded-full overflow-hidden ${className}`}
      role="progressbar"
      aria-valuenow={current}
      aria-valuemin={0}
      aria-valuemax={total}
      aria-label={`${current} מתוך ${total}`}
    >
      <motion.div
        className="relative h-full bg-[var(--th-accent)] rounded-full overflow-hidden"
        animate={{ width: `${pct}%` }}
        transition={{ type: "spring", stiffness: 120, damping: 18, mass: 0.8 }}
      >
        <motion.div
          key={pct}
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(90deg, transparent, rgba(255,255,255,0.35), transparent)",
          }}
          initial={{ x: "-100%" }}
          animate={{ x: "200%" }}
          transition={{ duration: 0.55, ease: "easeOut" }}
        />
      </motion.div>
    </div>
  );
}
