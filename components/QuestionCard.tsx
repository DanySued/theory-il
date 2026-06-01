"use client";

import { useEffect, useCallback } from "react";

export interface Question {
  id: string;
  topic: string;
  text: string;
  image?: string;
  answers: [string, string, string, string];
  correctIndex: 0 | 1 | 2 | 3;
  explanation?: string;
}

interface QuestionCardProps {
  question: Question;
  showAnswer: boolean;
  selectedAnswer: number | null;
  onReveal: () => void;
  onAnswer: (index: number) => void;
  onNext: () => void;
  onPrev: () => void;
  currentIndex: number;
  total: number;
}

const LABELS = ["א", "ב", "ג", "ד"] as const;

export default function QuestionCard({
  question,
  showAnswer,
  selectedAnswer,
  onReveal,
  onAnswer,
  onNext,
  onPrev,
  currentIndex,
  total,
}: QuestionCardProps) {
  const handleKey = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") {
        onNext();
      } else if (e.key === "ArrowRight") {
        onPrev();
      } else if (e.key === " " || e.key === "Spacebar") {
        e.preventDefault();
        if (!showAnswer) onReveal();
      } else if (["1", "2", "3", "4"].includes(e.key)) {
        const idx = parseInt(e.key, 10) - 1;
        if (!showAnswer) onAnswer(idx);
      }
    },
    [showAnswer, onReveal, onAnswer, onNext, onPrev]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [handleKey]);

  function getButtonStyle(idx: number): string {
    const base =
      "w-full text-start px-4 py-3 rounded-[var(--th-radius)] border text-sm font-medium transition-colors";
    if (!showAnswer) {
      return `${base} bg-[var(--th-card)] border-[var(--th-border)] hover:border-[var(--th-accent)] hover:bg-[var(--th-muted-bg)] cursor-pointer`;
    }
    if (idx === question.correctIndex) {
      return `${base} bg-[#dcfce7] border-[var(--th-success)] text-[var(--th-success)] cursor-default`;
    }
    if (idx === selectedAnswer && idx !== question.correctIndex) {
      return `${base} bg-[#fee2e2] border-[var(--th-error)] text-[var(--th-error)] cursor-default`;
    }
    return `${base} bg-[var(--th-card)] border-[var(--th-border)] opacity-60 cursor-default`;
  }

  return (
    <div className="w-full max-w-2xl flex flex-col gap-5">
      {/* Counter */}
      <div className="flex items-center justify-between text-sm text-[var(--th-muted)]">
        <span>
          שאלה {currentIndex + 1} מתוך {total}
        </span>
        <span className="text-xs px-2 py-0.5 rounded-full bg-[var(--th-muted-bg)]">
          {question.topic}
        </span>
      </div>

      {/* Question card */}
      <div className="rounded-[var(--th-radius)] border border-[var(--th-border)] bg-[var(--th-card)] p-5 flex flex-col gap-4">
        {/* Image */}
        {question.image && (
          <div className="flex justify-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={question.image}
              alt={question.text}
              className="max-h-48 object-contain rounded-lg"
            />
          </div>
        )}

        {/* Text */}
        <p className="text-lg font-semibold leading-relaxed">{question.text}</p>

        {/* Answers */}
        <div className="flex flex-col gap-2">
          {question.answers.map((answer, idx) => (
            <button
              key={idx}
              className={getButtonStyle(idx)}
              onClick={() => {
                if (!showAnswer) onAnswer(idx);
              }}
              disabled={showAnswer}
            >
              <span className="font-bold me-2 text-[var(--th-accent)]">{LABELS[idx]}.</span>
              {answer}
            </button>
          ))}
        </div>

        {/* Reveal button */}
        {!showAnswer && (
          <button
            onClick={onReveal}
            className="mt-1 self-start text-sm text-[var(--th-muted)] underline underline-offset-2 hover:text-[var(--th-fg)] transition-colors"
          >
            הצג תשובה
          </button>
        )}

        {/* Explanation (if available and answer shown) */}
        {showAnswer && question.explanation && (
          <p className="mt-1 text-sm text-[var(--th-muted)] border-t border-[var(--th-border)] pt-3 leading-relaxed">
            {question.explanation}
          </p>
        )}
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between gap-3">
        <button
          onClick={onPrev}
          disabled={currentIndex === 0}
          className="flex items-center gap-1 px-4 py-2 rounded-[var(--th-radius)] border border-[var(--th-border)] text-sm font-medium hover:bg-[var(--th-muted-bg)] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          {/* RTL: previous is visually on the right, arrow points right */}
          &#8592; הקודמת
        </button>
        <button
          onClick={onNext}
          disabled={currentIndex === total - 1}
          className="flex items-center gap-1 px-4 py-2 rounded-[var(--th-radius)] border border-[var(--th-border)] text-sm font-medium hover:bg-[var(--th-muted-bg)] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          הבאה &#8594;
        </button>
      </div>

      {/* Keyboard hint */}
      <p className="text-xs text-center text-[var(--th-muted)]">
        ← → לניווט · 1–4 לבחירה · רווח להצגת תשובה
      </p>
    </div>
  );
}
