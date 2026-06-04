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
    setDueCounts(getDueCountByTopic(questions));
  }, []);

  const topics = TOPIC_ORDER.map((topic) => {
    const total = questions.filter((q) => q.topic === topic).length;
    const due = dueCounts[topic] ?? total; // first time: all cards are due
    return { topic, total, due };
  });

  const totalDue = topics.reduce((s, t) => s + t.due, 0);

  return (
    <>
      <div className="w-full px-4 pt-3 flex justify-start">
        <BackButton />
      </div>
    <main className="flex flex-1 flex-col items-center px-6 py-12 gap-8">
      <div className="w-full max-w-2xl flex flex-col gap-2">
        <h1 className="text-3xl font-bold">כרטיסיות — חזרה מרווחת</h1>
        <p className="text-[var(--th-muted)]">
          {totalDue > 0
            ? `${totalDue} כרטיסיות לחזרה היום`
            : "אין כרטיסיות לחזרה — חזור מחר!"}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-2xl">
        {topics.map(({ topic, total, due }) => (
          <Link
            key={topic}
            href={`/flashcards/${encodeURIComponent(topic)}`}
            className="flex flex-col gap-3 p-6 rounded-[var(--th-radius)] bg-[var(--th-card)] border border-[var(--th-border)] hover:border-[var(--th-accent)] hover:shadow-sm transition-all"
          >
            <span className="text-xl font-bold">{topic}</span>
            <span className="text-sm text-[var(--th-muted)]">{total} כרטיסיות</span>
            {due > 0 ? (
              <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-[var(--th-accent)]">
                <span className="w-2 h-2 rounded-full bg-[var(--th-accent)] inline-block" />
                {due} לחזרה היום
              </span>
            ) : (
              <span className="text-sm text-[var(--th-success)]">✓ הכל בסדר</span>
            )}
          </Link>
        ))}
      </div>
    </main>
    </>
  );
}
