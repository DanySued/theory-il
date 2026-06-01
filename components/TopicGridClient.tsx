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
    setProgress(result);
  }, [questions]);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-2xl">
      {topics.map((t) => {
        const p = progress[t.key] ?? { seen: 0, correct: 0 };
        const seenPct = t.count > 0 ? (p.seen / t.count) * 100 : 0;
        const correctPct = p.seen > 0 ? (p.correct / p.seen) * seenPct : 0;

        return (
          <Link
            key={t.key}
            href={`/study/${encodeURIComponent(t.key)}`}
            className="flex flex-col gap-2 p-6 rounded-[var(--th-radius)] bg-[var(--th-card)] border border-[var(--th-border)] hover:border-[var(--th-accent)] hover:shadow-sm transition-all"
          >
            <span className="text-xl font-bold">{t.label}</span>
            <span className="text-sm text-[var(--th-muted)]">{t.count} שאלות</span>
            {seenPct > 0 && (
              <span className="text-xs text-[var(--th-muted)]">
                {p.seen}/{t.count} נצפו · {p.correct} נכונות
              </span>
            )}
            <div className="mt-1 h-1.5 w-full bg-[var(--th-muted-bg)] rounded-full overflow-hidden relative">
              <div
                className="absolute inset-y-0 start-0 bg-[var(--th-muted)] rounded-full transition-all duration-700"
                style={{ width: `${seenPct}%`, opacity: 0.5 }}
              />
              <div
                className="absolute inset-y-0 start-0 bg-[var(--th-success)] rounded-full transition-all duration-700"
                style={{ width: `${correctPct}%` }}
              />
            </div>
          </Link>
        );
      })}
    </div>
  );
}
