"use client";

import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { recordAnswer, getBookmarks, toggleBookmark } from "@/lib/storage";
import { LABELS } from "@/lib/constants";
import { useRipple } from "@/hooks/useRipple";

export interface Question {
  id: string;
  topic: string;
  text: string;
  textEn?: string;
  image?: string;
  answers: [string, string, string, string];
  answersEn?: [string, string, string, string];
  correctIndex: 0 | 1 | 2 | 3;
  explanation?: string;
  explanationEn?: string;
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
  direction?: number;
  trackStats?: boolean;
}

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
  direction = 1,
  trackStats = false,
}: QuestionCardProps) {
  const { ripples, addRipple } = useRipple();
  const [bookmarked, setBookmarked] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setBookmarked(getBookmarks().has(question.id));
  }, [question.id]);

  const handleToggleBookmark = useCallback(() => {
    const next = toggleBookmark(question.id);
    setBookmarked(next.has(question.id));
  }, [question.id]);

  const handleKey = useCallback(
    (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA")) return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;

      // RTL: ArrowRight = previous, ArrowLeft = next
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        onNext();
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        onPrev();
      } else if (e.key === " " || e.key === "Spacebar" || e.key === "r" || e.key === "R") {
        e.preventDefault();
        if (!showAnswer) onReveal();
      } else if (["1", "2", "3", "4"].includes(e.key)) {
        const idx = parseInt(e.key, 10) - 1;
        if (!showAnswer) {
          e.preventDefault();
          onAnswer(idx);
        }
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
      return `${base} bg-[var(--th-success-soft)] border-[var(--th-success)] text-[var(--th-success)] cursor-default border-e-4`;
    }
    if (idx === selectedAnswer && idx !== question.correctIndex) {
      return `${base} bg-[var(--th-error-soft)] border-[var(--th-error)] text-[var(--th-error)] cursor-default`;
    }
    return `${base} bg-[var(--th-card)] border-[var(--th-border)] opacity-60 cursor-default`;
  }

  function getAnswerAnimate(idx: number): { scale?: number[]; x?: number[] } {
    if (!showAnswer) return {};
    if (idx === question.correctIndex) return { scale: [1, 1.015, 1] };
    if (idx === selectedAnswer && idx !== question.correctIndex)
      return { x: [0, -5, 5, -3, 3, 0] };
    return {};
  }

  return (
    <div className="w-full max-w-2xl flex flex-col gap-5">
      {/* Counter */}
      <div className="flex items-center justify-between text-sm text-[var(--th-muted)]">
        <span>{`שאלה ${currentIndex + 1} מתוך ${total}`}</span>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleToggleBookmark}
            aria-label={bookmarked ? "הסר מהשמורות" : "שמור שאלה"}
            aria-pressed={bookmarked}
            className={`inline-flex items-center justify-center w-7 h-7 rounded-full transition-colors ${
              bookmarked
                ? "text-[var(--th-accent)] hover:bg-[var(--th-accent-soft)]"
                : "text-[var(--th-muted)] hover:text-[var(--th-fg)] hover:bg-[var(--th-muted-bg)]"
            }`}
            title={bookmarked ? "הסר מהשמורות" : "שמור שאלה"}
          >
            <span aria-hidden className="text-base leading-none">
              {bookmarked ? "★" : "☆"}
            </span>
          </button>
          <span className="text-xs px-2 py-0.5 rounded-full bg-[var(--th-muted-bg)]">
            {question.topic}
          </span>
        </div>
      </div>

      {/* Animated card with swipe */}
      <AnimatePresence mode="wait" custom={direction}>
        <motion.div
          key={question.id}
          custom={direction}
          variants={{
            enter: (d: number) => ({ x: d > 0 ? -40 : 40, opacity: 0 }),
            center: { x: 0, opacity: 1 },
            exit: (d: number) => ({ x: d > 0 ? 40 : -40, opacity: 0 }),
          }}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ duration: 0.18, ease: "easeInOut" }}
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.08}
          onDragEnd={(_, info) => {
            if (info.offset.x < -60) onNext();
            else if (info.offset.x > 60) onPrev();
          }}
          className="rounded-[var(--th-radius-lg)] border border-[var(--th-border)] bg-[var(--th-card)] p-5 flex flex-col gap-4 cursor-grab active:cursor-grabbing select-none"
        >
          {/* Image */}
          {question.image && (
            <div className="flex justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={question.image}
                alt={question.text}
                className="max-h-48 object-contain rounded-lg"
                draggable={false}
              />
            </div>
          )}

          {/* Text */}
          <p className="text-xl font-bold leading-relaxed">{question.text}</p>

          {/* Answers */}
          <div className="flex flex-col gap-2" onPointerDown={(e) => e.stopPropagation()}>
            {question.answers.map((answer, idx) => (
              <motion.button
                key={idx}
                className={`${getButtonStyle(idx)} relative overflow-hidden`}
                onClick={(e) => {
                  addRipple(e, idx);
                  if (!showAnswer) {
                    if (trackStats) recordAnswer(question.id, idx === question.correctIndex);
                    onAnswer(idx);
                  }
                }}
                disabled={showAnswer}
                animate={getAnswerAnimate(idx)}
                transition={{ duration: 0.3 }}
                whileTap={!showAnswer ? { scale: 0.98 } : {}}
              >
                <AnimatePresence>
                  {ripples.filter((r) => r.btnIdx === idx).map((r) => (
                    <motion.span
                      key={r.id}
                      className="absolute rounded-full pointer-events-none"
                      style={{ left: r.x - 4, top: r.y - 4, width: 8, height: 8, background: "currentColor" }}
                      initial={{ scale: 0, opacity: 0.25 }}
                      animate={{ scale: 50, opacity: 0 }}
                      exit={{}}
                      transition={{ duration: 0.55, ease: "easeOut" }}
                    />
                  ))}
                </AnimatePresence>
                <span className="relative">
                  <span className="font-bold me-2 text-[var(--th-accent)]">
                    {LABELS[idx]}.
                  </span>
                  {answer}
                </span>
              </motion.button>
            ))}
          </div>

          {/* Reveal button */}
          {!showAnswer && (
            <button
              onPointerDown={(e) => e.stopPropagation()}
              onClick={onReveal}
              className="mt-1 self-start px-4 py-1.5 rounded-full border border-[var(--th-border)] text-sm font-medium text-[var(--th-muted-strong)] hover:border-[var(--th-accent)] hover:text-[var(--th-accent)] transition-colors"
            >
              הצג תשובה
            </button>
          )}

          {/* Explanation */}
          {showAnswer && question.explanation && (
            <p className="mt-1 text-sm text-[var(--th-muted)] border-t border-[var(--th-border)] pt-3 leading-relaxed">
              {question.explanation}
            </p>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Navigation */}
      <div className="flex items-center justify-between gap-3">
        <button
          onClick={onPrev}
          disabled={currentIndex === 0}
          className="flex items-center gap-2 h-10 px-4 rounded-[var(--th-radius)] border border-[var(--th-border)] text-sm font-medium text-[var(--th-fg)] hover:bg-[var(--th-muted-bg)] hover:border-[var(--th-accent)] disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
        >
          <span className="text-base leading-none">&#8594;</span>
          הקודמת
        </button>
        <button
          onClick={onNext}
          disabled={currentIndex === total - 1}
          className="flex items-center gap-2 h-10 px-4 rounded-[var(--th-radius)] border border-[var(--th-border)] text-sm font-medium text-[var(--th-fg)] hover:bg-[var(--th-muted-bg)] hover:border-[var(--th-accent)] disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
        >
          הבאה
          <span className="text-base leading-none">&#8592;</span>
        </button>
      </div>

      {/* Keyboard hint */}
      <p className="text-xs text-center text-[var(--th-muted)]">
        ← → לניווט · 1–4 לבחירה · רווח להצגת תשובה
      </p>
    </div>
  );
}
