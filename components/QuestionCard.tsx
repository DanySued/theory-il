"use client";

import { useEffect, useLayoutEffect, useMemo, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Check, ChevronLeft, ChevronRight, X } from "lucide-react";
import { recordAnswer } from "@/lib/storage";
import { LABELS } from "@/lib/constants";
import { useRipple } from "@/hooks/useRipple";
import Explanation from "@/components/Explanation";
import BookmarkButton from "@/components/BookmarkButton";
import FocusActionBar, { focusIcon, focusPrimary, focusSecondary } from "@/components/FocusActionBar";
import { answerOrder, getSessionSeed, peekSessionSeed } from "@/lib/answerOrder";

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
  /**
   * Focus screen (drill): on phones the counter row and inline navigation give way to
   * the FocusHeader (owned by the caller) and a bottom FocusActionBar rendered here.
   */
  focusBar?: boolean;
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
  focusBar = false,
}: QuestionCardProps) {
  const { ripples, addRipple } = useRipple();
  const feedbackRef = useRef<HTMLDivElement>(null);

  // Answer order: identity on the server render, per-session shuffle once mounted.
  const [seed, setSeed] = useState(peekSessionSeed);
  useLayoutEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSeed(getSessionSeed());
  }, []);
  const order = useMemo(
    () => answerOrder(question.answers, question.id, seed),
    [question.answers, question.id, seed]
  );
  const correctPos = order.indexOf(question.correctIndex);

  // Bring the feedback into view on reveal (it sits below the answers on small screens);
  // focus screens set scroll-padding so it lands clear of the fixed bottom bar.
  useEffect(() => {
    if (showAnswer) feedbackRef.current?.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }, [showAnswer, question.id]);

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
        const idx = order[parseInt(e.key, 10) - 1];
        if (!showAnswer && idx !== undefined) {
          e.preventDefault();
          if (trackStats) recordAnswer(question.id, idx === question.correctIndex);
          onAnswer(idx);
        }
      } else if (e.key === "Enter" && showAnswer) {
        e.preventDefault();
        onNext();
      }
    },
    [showAnswer, onReveal, onAnswer, onNext, onPrev, order, trackStats, question.id, question.correctIndex]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [handleKey]);

  const isCorrectRow = (idx: number) => showAnswer && idx === question.correctIndex;
  const isWrongRow = (idx: number) =>
    showAnswer && idx === selectedAnswer && idx !== question.correctIndex;

  // Phones: 56px rows, 16px text, 14px radius, 2px state borders. ≥sm keeps the original.
  function getButtonStyle(idx: number): string {
    const base =
      "w-full min-h-14 sm:min-h-0 flex sm:block items-center gap-2.5 text-start px-3.5 sm:px-4 py-3 rounded-[14px] sm:rounded-[var(--th-radius)] text-base sm:text-sm leading-snug sm:leading-normal font-medium transition-colors";
    if (!showAnswer) {
      return `${base} border bg-[var(--th-card)] border-[var(--th-border)] hover:border-[var(--th-accent)] hover:bg-[var(--th-muted-bg)] active:bg-[var(--th-muted-bg)] cursor-pointer`;
    }
    if (isCorrectRow(idx)) {
      return `${base} border-2 sm:border sm:border-e-4 bg-[var(--th-success-soft)] border-[var(--th-success)] text-[var(--th-success-fg)] font-semibold sm:font-medium cursor-default`;
    }
    if (isWrongRow(idx)) {
      return `${base} border-2 sm:border bg-[var(--th-error-soft)] border-[var(--th-error)] text-[var(--th-error-fg)] font-semibold sm:font-medium cursor-default`;
    }
    return `${base} border bg-[var(--th-card)] border-[var(--th-border)] opacity-60 cursor-default`;
  }

  function getAnswerAnimate(idx: number): { scale?: number[]; x?: number[] } {
    if (!showAnswer) return {};
    if (idx === question.correctIndex) return { scale: [1, 1.015, 1] };
    if (idx === selectedAnswer && idx !== question.correctIndex)
      return { x: [0, -5, 5, -3, 3, 0] };
    return {};
  }

  const isLast = currentIndex === total - 1;
  const feedbackTone =
    selectedAnswer === null ? "neutral" : selectedAnswer === question.correctIndex ? "success" : "error";

  return (
    <div className="w-full max-w-2xl min-w-0 flex flex-col gap-5">
      {/* Counter (phones get it in the FocusHeader on focus screens) */}
      <div
        className={`${focusBar ? "hidden sm:flex" : "flex"} items-center justify-between text-sm text-[var(--th-muted)]`}
      >
        <span>{`שאלה ${currentIndex + 1} מתוך ${total}`}</span>
        <div className="flex items-center gap-1 sm:gap-2">
          <BookmarkButton
            questionId={question.id}
            className={(saved) =>
              `inline-flex items-center justify-center w-11 h-11 sm:w-7 sm:h-7 rounded-full transition-colors ${
                saved
                  ? "text-[var(--th-accent)] hover:bg-[var(--th-accent-soft)]"
                  : "text-[var(--th-muted)] hover:text-[var(--th-fg)] hover:bg-[var(--th-muted-bg)]"
              }`
            }
          />
          <span className="text-xs px-2 py-0.5 rounded-full bg-[var(--th-muted-bg)]">
            {question.topic}
          </span>
        </div>
      </div>

      {/* Animated card with swipe. The wrapper clips the drag/enter x-offset so the card
          can never widen the page (the old horizontal-overflow bug on phones). */}
      <div className="overflow-x-hidden [overflow-x:clip] min-w-0">
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
            className="rounded-[20px] sm:rounded-[var(--th-radius-lg)] border border-[var(--th-border)] bg-[var(--th-card)] p-4 sm:p-5 flex flex-col gap-3.5 sm:gap-4 cursor-grab active:cursor-grabbing select-none"
          >
            {/* Image */}
            {question.image && (
              <div className="flex justify-center py-1 sm:py-0">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={question.image}
                  alt="תמונה לשאלה" decoding="async"
                  className="max-h-40 sm:max-h-48 object-contain rounded-lg"
                  draggable={false}
                />
              </div>
            )}

            {/* Text */}
            <p className="text-xl font-bold leading-[1.45] sm:leading-relaxed">{question.text}</p>

            {/* Answers */}
            <div className="flex flex-col gap-2" onPointerDown={(e) => e.stopPropagation()}>
              {order.map((idx, pos) => (
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
                  <span className="relative flex-1 min-w-0">
                    <span
                      className={`font-bold me-2 ${
                        isCorrectRow(idx) || isWrongRow(idx)
                          ? ""
                          : "text-[var(--th-muted)] sm:text-[var(--th-accent)]"
                      }`}
                    >
                      {LABELS[pos]}.
                    </span>
                    {question.answers[idx]}
                  </span>
                  {isCorrectRow(idx) && <Check size={20} strokeWidth={2.5} aria-hidden className="relative shrink-0 sm:hidden" />}
                  {isWrongRow(idx) && <X size={20} strokeWidth={2.5} aria-hidden className="relative shrink-0 sm:hidden" />}
                </motion.button>
              ))}
            </div>

            {/* Reveal button (the phone action bar carries it on focus screens) */}
            {!showAnswer && (
              <button
                onPointerDown={(e) => e.stopPropagation()}
                onClick={onReveal}
                className={`${focusBar ? "hidden sm:inline-flex" : "inline-flex"} items-center mt-1 self-start min-h-11 sm:min-h-0 px-4 py-1.5 rounded-full border border-[var(--th-border)] text-sm font-medium text-[var(--th-muted-strong)] hover:border-[var(--th-accent)] hover:text-[var(--th-accent)] transition-colors`}
              >
                הצג תשובה
              </button>
            )}

            {/* Feedback + explanation: a tinted strip on phones, the original ruled block ≥sm */}
            {showAnswer && (
              <div
                ref={feedbackRef}
                role="status"
                aria-live="polite"
                className={`sm:mt-1 flex flex-col gap-2 rounded-xl sm:rounded-none px-3 py-2.5 sm:px-0 sm:py-0 sm:pt-3 sm:border-t sm:border-[var(--th-border)] sm:bg-transparent ${
                  feedbackTone === "success"
                    ? "bg-[var(--th-success-soft)]"
                    : feedbackTone === "error"
                      ? "bg-[var(--th-error-soft)]"
                      : "bg-[var(--th-muted-bg)]"
                }`}
              >
                <p
                  className={`text-sm font-bold ${
                    feedbackTone === "neutral"
                      ? "text-[var(--th-fg)]"
                      : feedbackTone === "success"
                        ? "text-[var(--th-success-fg)]"
                        : "text-[var(--th-error-fg)]"
                  }`}
                >
                  {selectedAnswer === null
                    ? `התשובה הנכונה: ${LABELS[correctPos]}`
                    : selectedAnswer === question.correctIndex
                      ? "✓ נכון!"
                      : `✗ לא נכון — התשובה הנכונה היא ${LABELS[correctPos]}`}
                </p>
                <Explanation question={question} />
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation */}
      <div className={`${focusBar ? "hidden sm:flex" : "flex"} items-center justify-between gap-3`}>
        <button
          onClick={onPrev}
          disabled={currentIndex === 0}
          className="flex items-center gap-2 h-11 sm:h-10 px-4 rounded-[var(--th-radius)] border border-[var(--th-border)] text-sm font-medium text-[var(--th-fg)] hover:bg-[var(--th-muted-bg)] hover:border-[var(--th-accent)] disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
        >
          <span aria-hidden="true" className="text-base leading-none">&#8594;</span>
          הקודמת
        </button>
        <button
          onClick={onNext}
          disabled={isLast}
          className={`flex items-center gap-2 h-11 sm:h-10 px-4 rounded-[var(--th-radius)] border text-sm font-medium disabled:opacity-60 disabled:cursor-not-allowed transition-colors ${
            showAnswer && !isLast
              ? "bg-[var(--th-accent)] border-[var(--th-accent)] text-[var(--th-on-accent)] hover:bg-[var(--th-accent-hover)]"
              : "border-[var(--th-border)] text-[var(--th-fg)] hover:bg-[var(--th-muted-bg)] hover:border-[var(--th-accent)]"
          }`}
        >
          הבאה
          <span aria-hidden="true" className="text-base leading-none">&#8592;</span>
        </button>
      </div>

      {/* Keyboard hint (desktop only) */}
      <p className="hidden sm:block text-xs text-center text-[var(--th-muted)]">
        ← → לניווט · 1–4 לבחירה · רווח להצגת תשובה · Enter לשאלה הבאה
      </p>

      {focusBar && (
        <FocusActionBar>
          <button type="button" onClick={onPrev} disabled={currentIndex === 0} aria-label="השאלה הקודמת" className={focusIcon}>
            <ChevronRight size={24} aria-hidden />
          </button>
          {showAnswer ? (
            <button type="button" onClick={onNext} disabled={isLast} className={focusPrimary}>
              {isLast ? "סוף השאלות בנושא" : "השאלה הבאה"}
              {!isLast && <ChevronLeft size={20} strokeWidth={2.2} aria-hidden />}
            </button>
          ) : (
            <>
              <button type="button" onClick={onReveal} className={`${focusSecondary} flex-1`}>
                הצג תשובה
              </button>
              <button type="button" onClick={onNext} disabled={isLast} aria-label="השאלה הבאה" className={focusIcon}>
                <ChevronLeft size={24} aria-hidden />
              </button>
            </>
          )}
        </FocusActionBar>
      )}
    </div>
  );
}
