"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import QuestionCard, { type Question } from "@/components/QuestionCard";
import ProgressBar from "@/components/ProgressBar";

interface DrillClientProps {
  topic: string;
  questions: Question[];
}

export default function DrillClient({ topic, questions }: DrillClientProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [jumpInput, setJumpInput] = useState("");

  const total = questions.length;

  const goTo = useCallback(
    (idx: number) => {
      const clamped = Math.max(0, Math.min(total - 1, idx));
      setCurrentIndex(clamped);
      setShowAnswer(false);
      setSelectedAnswer(null);
      setJumpInput("");
    },
    [total]
  );

  const handleReveal = useCallback(() => {
    setShowAnswer(true);
  }, []);

  const handleAnswer = useCallback((idx: number) => {
    setSelectedAnswer(idx);
    setShowAnswer(true);
  }, []);

  const handleNext = useCallback(() => goTo(currentIndex + 1), [currentIndex, goTo]);
  const handlePrev = useCallback(() => goTo(currentIndex - 1), [currentIndex, goTo]);

  const handleJump = (e: React.FormEvent) => {
    e.preventDefault();
    const n = parseInt(jumpInput, 10);
    if (!isNaN(n) && n >= 1 && n <= total) {
      goTo(n - 1);
    }
  };

  if (total === 0) {
    return (
      <main className="flex flex-1 flex-col items-center justify-center px-6 py-16 gap-4">
        <p className="text-[var(--th-muted)]">לא נמצאו שאלות לנושא זה.</p>
        <Link href="/study" className="text-[var(--th-accent)] underline">
          חזרה לנושאים
        </Link>
      </main>
    );
  }

  const question = questions[currentIndex];

  return (
    <main className="flex flex-1 flex-col items-center px-4 py-8 gap-6">
      {/* Back link + topic title */}
      <div className="w-full max-w-2xl flex items-center justify-between">
        <Link
          href="/study"
          className="text-sm text-[var(--th-muted)] hover:text-[var(--th-fg)] transition-colors"
        >
          ← כל הנושאים
        </Link>
        <span className="text-sm font-semibold">{topic}</span>
      </div>

      {/* Progress bar */}
      <div className="w-full max-w-2xl flex flex-col gap-1">
        <ProgressBar current={currentIndex + 1} total={total} />
      </div>

      {/* Question card */}
      <QuestionCard
        question={question}
        showAnswer={showAnswer}
        selectedAnswer={selectedAnswer}
        onReveal={handleReveal}
        onAnswer={handleAnswer}
        onNext={handleNext}
        onPrev={handlePrev}
        currentIndex={currentIndex}
        total={total}
      />

      {/* Jump to question */}
      <form
        onSubmit={handleJump}
        className="flex items-center gap-2 text-sm text-[var(--th-muted)]"
      >
        <label htmlFor="jump-input" className="whitespace-nowrap">
          קפוץ לשאלה:
        </label>
        <input
          id="jump-input"
          type="number"
          min={1}
          max={total}
          value={jumpInput}
          onChange={(e) => setJumpInput(e.target.value)}
          className="w-16 text-center rounded-lg border border-[var(--th-border)] bg-[var(--th-card)] px-2 py-1 text-[var(--th-fg)] focus:outline-none focus:border-[var(--th-accent)]"
          placeholder="מס׳"
        />
        <button
          type="submit"
          className="px-3 py-1 rounded-lg border border-[var(--th-border)] hover:bg-[var(--th-muted-bg)] transition-colors"
        >
          עבור
        </button>
      </form>
    </main>
  );
}
