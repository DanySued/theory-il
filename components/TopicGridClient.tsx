"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getQStats } from "@/lib/storage";
import type { Question } from "@/components/QuestionCard";

interface TopicItem {
  key: string;
  label: string;
  count: number;
}

interface Props {
  topics: TopicItem[];
  questions: Question[];
}

export default function TopicGridClient({ topics, questions }: Props) {
  const [progress, setProgress] = useState<
    Record<string, { seen: number; correct: number }>
  >({});

  useEffect(() => {
    const stats = getQStats();
    const result: Record<string, { seen: number; correct: number }> = {};
    for (const q of questions) {
      if (!result[q.topic]) result[q.topic] = { seen: 0, correct: 0 };
      const s = stats[q.id];
      if (s && s.seen > 0) {
        result[q.topic].seen++;
        // count as "correct" if more correct answers than wrong
        if (s.correct > s.wrong) result[q.topic].correct++;
      }
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setProgress(result);
  }, [questions]);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-3xl">
      {topics.map((t, i) => {
        const p = progress[t.key] ?? { seen: 0, correct: 0 };
        const seenPct = t.count > 0 ? (p.seen / t.count) * 100 : 0;
        const correctPct = p.seen > 0 ? (p.correct / p.seen) * seenPct : 0;
        const hasProgress = seenPct > 0;

        return (
          <Link
            key={t.key}
            href={`/study/${encodeURIComponent(t.key)}`}
            className="group relative flex flex-col gap-3 p-6 rounded-[var(--th-radius-lg)] bg-[var(--th-card)] border border-[var(--th-border)] hover:border-[var(--th-accent)] hover:shadow-[0_8px_24px_-12px_rgba(29,78,216,0.25)] hover:-translate-y-0.5 transition-all"
          >
            <div className="flex items-baseline justify-between">
              <span className="text-[0.7rem] font-bold tracking-[0.18em] text-[var(--th-muted)] tabular-nums">
                {String(i + 1).padStart(2, "0")}
              </span>
              <span
                aria-hidden
                className="text-[var(--th-muted)] group-hover:text-[var(--th-accent)] group-hover:-translate-x-1 transition-all"
              >
                ←
              </span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-2xl font-extrabold tracking-tight leading-tight">
                {t.label}
              </span>
              <span className="text-sm text-[var(--th-muted)]">
                {t.count} שאלות
                {hasProgress && (
                  <>
                    {" · "}
                    <span className="text-[var(--th-muted-strong)]">
                      {p.seen}/{t.count} נצפו
                    </span>
                  </>
                )}
              </span>
            </div>
            {hasProgress && (
              <div className="mt-1 h-1 w-full bg-[var(--th-muted-bg)] rounded-full overflow-hidden relative">
                <div
                  className="absolute inset-y-0 start-0 bg-[var(--th-muted)]/40 rounded-full transition-all duration-700"
                  style={{ width: `${seenPct}%` }}
                />
                <div
                  className="absolute inset-y-0 start-0 bg-[var(--th-success)] rounded-full transition-all duration-700"
                  style={{ width: `${correctPct}%` }}
                />
              </div>
            )}
          </Link>
        );
      })}
    </div>
  );
}
