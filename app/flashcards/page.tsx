"use client";

import { useEffect, useState } from "react";
import TopicCard from "@/components/TopicCard";
import type { Question } from "@/components/QuestionCard";
import { loadCorpus } from "@/lib/data/corpus";
import { getDueCountByTopic } from "@/lib/srs";
import PageShell from "@/components/PageShell";
import SectionHead from "@/components/SectionHead";
import Skeleton from "@/components/Skeleton";

const TOPIC_ORDER = ["חוקי התנועה", "תמרורים", "בטיחות", "הכרת הרכב"];

export default function FlashcardsPage() {
  const [questions, setQuestions] = useState<Question[] | null>(null);
  const [dueCounts, setDueCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    loadCorpus().then((all) => {
      setQuestions(all);
      setDueCounts(getDueCountByTopic(all));
    });
  }, []);

  const topics = TOPIC_ORDER.map((topic) => {
    const total = questions ? questions.filter((q) => q.topic === topic).length : 0;
    const due = dueCounts[topic] ?? total; // first time: all cards are due
    return { topic, total, due };
  });

  const totalDue = topics.reduce((s, t) => s + t.due, 0);

  if (questions === null) {
    return (
      <PageShell>
        <div className="w-full flex flex-col gap-3">
          <Skeleton className="h-3 w-28" />
          <Skeleton className="h-10 w-64 max-w-full" />
          <Skeleton className="h-5 w-full max-w-md" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-36 rounded-[var(--th-radius-lg)]" />
          ))}
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <SectionHead
        eyebrow="חזרה מרווחת · SRS"
        title="כרטיסיות שינון"
        subtitle={
          totalDue > 0
            ? `${totalDue} כרטיסיות מחכות לחזרה היום — בחר נושא כדי להתחיל.`
            : "אין כרטיסיות לחזרה — חזור מחר."
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
        {topics.map(({ topic, total, due }) => (
          <TopicCard
            key={topic}
            href={`/flashcards/${encodeURIComponent(topic)}`}
            title={topic}
            tag="חזרה מרווחת"
            meta={`${total} כרטיסיות`}
            badge={
              due > 0 ? (
                <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-[var(--th-accent)]">
                  <span className="w-2 h-2 rounded-full bg-[var(--th-accent)] inline-block animate-pulse" />
                  {due} לחזרה היום
                </span>
              ) : (
                <span className="text-sm font-medium text-[var(--th-success)]">
                  ✓ הכל בסדר
                </span>
              )
            }
          />
        ))}
      </div>
    </PageShell>
  );
}
