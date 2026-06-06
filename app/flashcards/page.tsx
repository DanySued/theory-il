"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import questionsData from "@/lib/data/questions.json";
import type { Question } from "@/components/QuestionCard";
import { getDueCountByTopic } from "@/lib/srs";
import BackButton from "@/components/BackButton";

const questions = questionsData as Question[];
const TOPIC_ORDER = ["חוקי התנועה", "תמרורים", "בטיחות", "הכרת הרכב"];

export default function FlashcardsPage() {
  const [dueCounts, setDueCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setDueCounts(getDueCountByTopic(questions));
  }, []);

  const topics = TOPIC_ORDER.map((topic) => {
    const total = questions.filter((q) => q.topic === topic).length;
    const due = dueCounts[topic] ?? total; // first time: all cards are due
    return { topic, total, due };
  });

  const totalDue = topics.reduce((s, t) => s + t.due, 0);

  return (
    <main className="flex flex-1 flex-col items-center px-6 py-8 gap-8">
      <div className="w-full max-w-5xl flex justify-start">
        <BackButton />
      </div>
      <div className="w-full max-w-5xl flex flex-col gap-2">
        <span className="th-eyebrow">חזרה מרווחת · SRS</span>
        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight leading-none">
          כרטיסיות
        </h1>
        <p className="text-[var(--th-muted-strong)] text-base mt-1">
          {totalDue > 0
            ? `${totalDue} כרטיסיות מחכות לחזרה היום.`
            : "אין כרטיסיות לחזרה — חזור מחר."}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-5xl">
        {topics.map(({ topic, total, due }, i) => (
          <Link
            key={topic}
            href={`/flashcards/${encodeURIComponent(topic)}`}
            className="group relative flex flex-col gap-3 p-6 rounded-[var(--th-radius)] bg-[var(--th-card)] border border-[var(--th-border)] hover:border-[var(--th-accent)] hover:shadow-[0_8px_24px_-12px_rgba(29,78,216,0.25)] hover:-translate-y-0.5 transition-all"
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
                {topic}
              </span>
              <span className="text-sm text-[var(--th-muted)]">
                {total} כרטיסיות
              </span>
            </div>
            {due > 0 ? (
              <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-[var(--th-accent)]">
                <span className="w-2 h-2 rounded-full bg-[var(--th-accent)] inline-block animate-pulse" />
                {due} לחזרה היום
              </span>
            ) : (
              <span className="text-sm font-medium text-[var(--th-success)]">
                ✓ הכל בסדר
              </span>
            )}
          </Link>
        ))}
      </div>
    </main>
  );
}
