"use client";

import { useEffect, useState } from "react";
import questionsData from "@/lib/data/questions.json";
import TopicCard from "@/components/TopicCard";
import type { Question } from "@/components/QuestionCard";
import { getDueCountByTopic } from "@/lib/srs";
import PageShell from "@/components/PageShell";
import SectionHead from "@/components/SectionHead";

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
        {topics.map(({ topic, total, due }, i) => (
          <TopicCard
            key={topic}
            href={`/flashcards/${encodeURIComponent(topic)}`}
            title={topic}
            index={i}
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
