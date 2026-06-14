"use client";

import { useEffect, useState } from "react";
import { getQStats } from "@/lib/storage";
import type { Question } from "@/components/QuestionCard";
import TopicCard from "@/components/TopicCard";

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
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
      {topics.map((t, i) => {
        const p = progress[t.key] ?? { seen: 0, correct: 0 };
        const seenPct = t.count > 0 ? (p.seen / t.count) * 100 : 0;
        const correctPct = p.seen > 0 ? (p.correct / p.seen) * seenPct : 0;
        const hasProgress = seenPct > 0;

        return (
          <TopicCard
            key={t.key}
            href={`/study/${encodeURIComponent(t.key)}`}
            title={t.label}
            index={i}
            meta={
              <>
                {t.count} שאלות
                {hasProgress && (
                  <>
                    {" · "}
                    <span className="text-[var(--th-muted-strong)]">
                      {p.seen}/{t.count} נצפו
                    </span>
                  </>
                )}
              </>
            }
            progress={
              hasProgress && (
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
              )
            }
          />
        );
      })}
    </div>
  );
}
