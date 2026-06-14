"use client";

import { useState } from "react";
import { motion } from "motion/react";

const TOPICS = [
  { value: "all", label: "כל הנושאים" },
  { value: "חוקי התנועה", label: "חוקי התנועה" },
  { value: "תמרורים", label: "תמרורים" },
  { value: "בטיחות", label: "בטיחות" },
  { value: "הכרת הרכב", label: "הכרת הרכב" },
];

const LENGTHS = [10, 20, 30, 40];

export interface ExamConfig {
  topic: string | null;
  length: number;
  weakFocus: boolean;
}

export default function ExamStartScreen({
  onStart,
}: {
  onStart: (config: ExamConfig) => void;
}) {
  const [topic, setTopic] = useState<string>("all");
  const [length, setLength] = useState<number>(30);
  const [weakFocus, setWeakFocus] = useState<boolean>(false);

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-3">
        <span className="th-eyebrow">סימולציה · {length} שאלות · {Math.round((length * 80) / 60)} דקות</span>
        <h1 className="th-page-title">מבחן מדומה</h1>
      </div>

      <div className="flex flex-col gap-3">
        <span className="th-eyebrow">נושא</span>
        <div className="flex flex-wrap gap-2">
          {TOPICS.map((t) => {
            const active = topic === t.value;
            return (
              <button
                key={t.value}
                type="button"
                onClick={() => setTopic(t.value)}
                className={`px-4 py-2 rounded-full text-sm font-medium border transition-all ${
                  active
                    ? "bg-[var(--th-fg)] text-[var(--th-bg)] border-[var(--th-fg)]"
                    : "bg-[var(--th-card)] text-[var(--th-muted-strong)] border-[var(--th-border)] hover:border-[var(--th-border-strong)] hover:text-[var(--th-fg)]"
                }`}
              >
                {t.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <span className="th-eyebrow">מספר שאלות</span>
        <div className="flex flex-wrap gap-2">
          {LENGTHS.map((n) => {
            const active = length === n;
            return (
              <button
                key={n}
                type="button"
                onClick={() => setLength(n)}
                aria-pressed={active}
                className={`px-4 py-2 rounded-full text-sm font-medium border transition-all tabular-nums ${
                  active
                    ? "bg-[var(--th-fg)] text-[var(--th-bg)] border-[var(--th-fg)]"
                    : "bg-[var(--th-card)] text-[var(--th-muted-strong)] border-[var(--th-border)] hover:border-[var(--th-border-strong)] hover:text-[var(--th-fg)]"
                }`}
              >
                {n}
              </button>
            );
          })}
        </div>
      </div>

      <label className="flex items-start gap-3 p-4 rounded-[var(--th-radius-lg)] border border-[var(--th-border)] cursor-pointer hover:bg-[var(--th-muted-bg)]/40 transition-colors">
        <input
          type="checkbox"
          checked={weakFocus}
          onChange={(e) => setWeakFocus(e.target.checked)}
          className="mt-1 accent-[var(--th-accent)] w-4 h-4"
        />
        <span className="flex flex-col gap-1">
          <span className="text-sm font-semibold text-[var(--th-fg)]">התמקד בחולשות שלי</span>
          <span className="text-xs text-[var(--th-muted)] leading-relaxed">
            נדגום שאלות לפי הנתונים שלך — מה שטעית בו, מה ששמרת, ומה שעוד לא ראית.
          </span>
        </span>
      </label>

      <motion.button
        key={`${topic}-${length}-${weakFocus}`}
        type="button"
        onClick={() =>
          onStart({
            topic: topic === "all" ? null : topic,
            length,
            weakFocus,
          })
        }
        initial={{ opacity: 0.7 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
        whileHover={{ scale: 1.015 }}
        whileTap={{ scale: 0.97 }}
        className="w-full max-w-sm inline-flex items-center justify-center h-14 px-8 rounded-[var(--th-radius-lg)] bg-[var(--th-accent)] text-white text-base font-semibold shadow-sm hover:bg-[var(--th-accent-hover)] hover:shadow-md"
      >
        התחל מבחן
        <span aria-hidden className="ms-2">←</span>
      </motion.button>

      <p className="text-xs text-[var(--th-muted)] text-center">
        לעבור צריך 26 תשובות נכונות מתוך 30.
      </p>
    </div>
  );
}
