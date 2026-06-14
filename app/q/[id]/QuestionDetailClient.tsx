"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import QuestionCard, { type Question } from "@/components/QuestionCard";
import PageShell from "@/components/PageShell";
import SectionHead from "@/components/SectionHead";

interface Props {
  question: Question;
}

export default function QuestionDetailClient({ question }: Props) {
  const [showAnswer, setShowAnswer] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);

  const handleReveal = useCallback(() => setShowAnswer(true), []);
  const handleAnswer = useCallback((idx: number) => {
    setSelectedAnswer(idx);
    setShowAnswer(true);
  }, []);
  // No prev/next in a single-question view — these become no-ops.
  const noop = useCallback(() => {}, []);

  return (
    <PageShell>
      <SectionHead
        eyebrow={question.topic}
        title="שאלה בודדת"
        subtitle="קישור ישיר לשאלה הזו. אפשר לסמן בכוכב, לחשוף את התשובה, או לעבור ללימוד הנושא כולו."
      />

      <QuestionCard
        question={question}
        showAnswer={showAnswer}
        selectedAnswer={selectedAnswer}
        onReveal={handleReveal}
        onAnswer={handleAnswer}
        onNext={noop}
        onPrev={noop}
        currentIndex={0}
        total={1}
      />

      <div className="flex flex-wrap gap-3">
        <Link
          href={`/study/${encodeURIComponent(question.topic)}`}
          className="inline-flex items-center justify-center h-11 px-5 rounded-[var(--th-radius-lg)] border border-[var(--th-border)] text-sm font-medium hover:bg-[var(--th-muted-bg)] transition-colors"
        >
          ללימוד הנושא: {question.topic}
        </Link>
        <Link
          href="/saved"
          className="inline-flex items-center justify-center h-11 px-5 rounded-[var(--th-radius-lg)] border border-[var(--th-border)] text-sm font-medium hover:bg-[var(--th-muted-bg)] transition-colors"
        >
          השמורות שלי
        </Link>
      </div>
    </PageShell>
  );
}
