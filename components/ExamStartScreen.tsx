"use client";

import { useState } from "react";

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
    <main className="flex flex-1 flex-col items-center justify-center px-6 py-16">
      <div className="w-full max-w-lg flex flex-col gap-8">
        <div className="flex flex-col gap-3 text-center">
          <span className="th-eyebrow">סימולציה · 30 שאלות</span>
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight leading-none">
            מבחן מדומה
          </h1>
          <p className="text-[var(--th-muted-strong)]">
            לעבור צריך 26 תשובות נכונות מתוך 30.
          </p>
        </div>

        <div className="th-rule" />

        <div className="flex flex-col gap-3">
          <label className="th-eyebrow text-[var(--th-muted-strong)]">
            נושא
          </label>
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

        <button
          type="button"
          onClick={() => onStart(topic === "all" ? null : topic)}
          className="mt-2 inline-flex items-center justify-center h-14 px-8 rounded-xl bg-[var(--th-accent)] text-white text-base font-semibold shadow-sm hover:bg-[var(--th-accent-hover)] hover:shadow-md transition-all"
        >
          התחל מבחן
          <span aria-hidden className="mr-2">←</span>
        </button>
      </div>
    </main>
  );
}
