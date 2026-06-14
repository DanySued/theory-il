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

export default function ExamStartScreen({
  onStart,
}: {
  onStart: (topic: string | null) => void;
}) {
  const [topic, setTopic] = useState<string>("all");

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-3 text-center">
        <span className="th-eyebrow">סימולציה · 30 שאלות · 40 דקות</span>
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

      <motion.button
        key={topic}
        type="button"
        onClick={() => onStart(topic === "all" ? null : topic)}
        initial={{ opacity: 0.7 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
        whileHover={{ scale: 1.015 }}
        whileTap={{ scale: 0.97 }}
        className="w-full inline-flex items-center justify-center h-14 px-8 rounded-[var(--th-radius-lg)] bg-[var(--th-accent)] text-white text-base font-semibold shadow-sm hover:bg-[var(--th-accent-hover)] hover:shadow-md"
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
