"use client";

import { useEffect, useCallback, useState, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { recordAnswer } from "@/lib/storage";
import { useLang } from "@/lib/lang-context";
import { t } from "@/lib/i18n";

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
  direction = 1,
  trackStats = false,
}: QuestionCardProps) {
  const { locale } = useLang();

  const [ripples, setRipples] = useState<{ id: number; x: number; y: number; btnIdx: number }[]>([]);
  const rippleCounter = useRef(0);

  function addRipple(e: React.MouseEvent<HTMLButtonElement>, btnIdx: number) {
    const rect = e.currentTarget.getBoundingClientRect();
    const id = rippleCounter.current++;
    setRipples((prev) => [...prev, { id, x: e.clientX - rect.left, y: e.clientY - rect.top, btnIdx }]);
    setTimeout(() => setRipples((prev) => prev.filter((r) => r.id !== id)), 600);
  }

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

  function getAnswerAnimate(idx: number): { scale?: number[]; x?: number[] } {
    if (!showAnswer) return {};
    if (idx === question.correctIndex) return { scale: [1, 1.015, 1] };
    if (idx === selectedAnswer && idx !== question.correctIndex)
      return { x: [0, -5, 5, -3, 3, 0] };
    return {};
  }

  const displayText =
    locale === "en" && question.textEn ? question.textEn : question.text;
  const displayAnswers =
    locale === "en" && question.answersEn ? question.answersEn : question.answers;
  const displayExplanation =
    locale === "en" && question.explanationEn
      ? question.explanationEn
      : question.explanation;

  return (
    <div className="w-full max-w-2xl flex flex-col gap-5">
      {/* Counter */}
      <div className="flex items-center justify-between text-sm text-[var(--th-muted)]">
        <span>
          {t("q.of", locale) === "מתוך"
            ? `שאלה ${currentIndex + 1} מתוך ${total}`
            : `Question ${currentIndex + 1} of ${total}`}
        </span>
        <span className="text-xs px-2 py-0.5 rounded-full bg-[var(--th-muted-bg)]">
          {question.topic}
        </span>
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
          className="rounded-[var(--th-radius)] border border-[var(--th-border)] bg-[var(--th-card)] p-5 flex flex-col gap-4 cursor-grab active:cursor-grabbing select-none"
        >
          {/* Image */}
          {question.image && (
            <div className="flex justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={question.image}
                alt={displayText}
                className="max-h-48 object-contain rounded-lg"
                draggable={false}
              />
            </div>
          )}

          {/* Text */}
          <p className="text-lg font-semibold leading-relaxed">{displayText}</p>

          {/* Answers */}
          <div className="flex flex-col gap-2" onPointerDown={(e) => e.stopPropagation()}>
            {displayAnswers.map((answer, idx) => (
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
              className="mt-1 self-start text-sm text-[var(--th-muted)] underline underline-offset-2 hover:text-[var(--th-fg)] transition-colors"
            >
              {t("q.reveal", locale)}
            </button>
          )}

          {/* Explanation */}
          {showAnswer && displayExplanation && (
            <p className="mt-1 text-sm text-[var(--th-muted)] border-t border-[var(--th-border)] pt-3 leading-relaxed">
              {displayExplanation}
            </p>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Navigation */}
      <div className="flex items-center justify-between gap-3">
        <button
          onClick={onPrev}
          disabled={currentIndex === 0}
          className="flex items-center gap-1 px-4 py-2 rounded-[var(--th-radius)] border border-[var(--th-border)] text-sm font-medium hover:bg-[var(--th-muted-bg)] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          &#8592; {t("q.prev", locale)}
        </button>
        <button
          onClick={onNext}
          disabled={currentIndex === total - 1}
          className="flex items-center gap-1 px-4 py-2 rounded-[var(--th-radius)] border border-[var(--th-border)] text-sm font-medium hover:bg-[var(--th-muted-bg)] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          {t("q.next", locale)} &#8594;
        </button>
      </div>

      {/* Keyboard hint */}
      <p className="text-xs text-center text-[var(--th-muted)]">
        {t("q.keyboard_hint", locale)}
      </p>
    </div>
  );
}
