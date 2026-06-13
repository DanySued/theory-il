"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import type { Question } from "@/components/QuestionCard";
import { saveAttempt, generateId } from "@/lib/storage";
import { LABELS } from "@/lib/constants";
import { useRipple } from "@/hooks/useRipple";

const EXAM_DURATION = 40 * 60;

function formatTime(s: number): string {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
}

export default function ExamRunner({ questions, noTimer = false }: { questions: Question[]; noTimer?: boolean }) {
  const router = useRouter();
  const [examId] = useState(() => generateId());
  const [startedAt] = useState(() => Date.now());

  const { ripples, addRipple } = useRipple();

  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<(number | null)[]>(() =>
    new Array(questions.length).fill(null)
  );
  const [markedForReview, setMarkedForReview] = useState<boolean[]>(() =>
    new Array(questions.length).fill(false)
  );
  const [secondsLeft, setSecondsLeft] = useState(EXAM_DURATION);
  const [submitted, setSubmitted] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showExitConfirm, setShowExitConfirm] = useState(false);

  // Refs so the timer callback always reads the latest state
  const answersRef = useRef(answers);
  const markedRef = useRef(markedForReview);
  const secondsRef = useRef(EXAM_DURATION);
  const submittedRef = useRef(false);

  useEffect(() => { answersRef.current = answers; }, [answers]);
  useEffect(() => { markedRef.current = markedForReview; }, [markedForReview]);
  useEffect(() => { secondsRef.current = secondsLeft; }, [secondsLeft]);

  const doSubmit = useCallback(() => {
    if (submittedRef.current) return;
    submittedRef.current = true;
    setSubmitted(true);
    saveAttempt({
      id: examId,
      startedAt: startedAt,
      finishedAt: Date.now(),
      questions,
      answers: answersRef.current,
      markedForReview: markedRef.current,
      timeSpentSeconds: Math.round((Date.now() - startedAt) / 1000),
    });
    router.push(`/results/${examId}`);
  }, [questions, router, examId, startedAt]);

  useEffect(() => {
    if (noTimer) return;
    const interval = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          clearInterval(interval);
          setTimeout(() => doSubmit(), 0);
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [doSubmit, noTimer]);

  const q = questions[currentIdx];
  const answeredCount = useMemo(() => answers.filter((a) => a !== null).length, [answers]);
  const isLowTime = secondsLeft < 5 * 60;

  function navCircleClass(i: number): string {
    const isAnswered = answers[i] !== null;
    const isMarked = markedForReview[i];
    const isCurrent = i === currentIdx;
    let cls =
      "w-8 h-8 rounded-full text-xs font-bold flex items-center justify-center cursor-pointer transition-all border-2 ";
    cls += isCurrent ? "border-[var(--th-accent)] scale-110 " : "border-transparent ";
    if (isMarked && isAnswered) cls += "bg-amber-400 text-amber-950 dark:bg-amber-500 dark:text-amber-950 ";
    else if (isMarked) cls += "bg-amber-200 text-amber-900 dark:bg-amber-700 dark:text-amber-100 ";
    else if (isAnswered) cls += "bg-[var(--th-accent)] text-white ";
    else cls += "bg-[var(--th-muted-bg)] text-[var(--th-muted)] ";
    return cls;
  }

  return (
    <main className="flex flex-1 flex-col">
      {/* Sticky top bar */}
      <div className="sticky top-0 z-10 bg-[var(--th-card)] border-b border-[var(--th-border)]">
        <div className="px-4 py-3 flex items-center justify-between gap-4">
          <button
            type="button"
            onClick={() => setShowExitConfirm(true)}
            aria-label="יציאה מהמבחן"
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-sm text-[var(--th-muted)] hover:text-[var(--th-fg)] hover:bg-[var(--th-muted-bg)] transition-colors border border-[var(--th-border)]"
          >
            <span aria-hidden="true">&#8594;</span>
            יציאה
          </button>
          {!noTimer && (
            <span
              className={`font-mono text-lg font-bold tabular-nums ${
                isLowTime ? "text-[var(--th-error)]" : "text-[var(--th-fg)]"
              }`}
            >
              {formatTime(secondsLeft)}
            </span>
          )}
          <span className="text-sm text-[var(--th-muted)] hidden sm:block">
            {answeredCount}/{questions.length} נענו
          </span>
          <button
            disabled={submitted}
            onClick={() =>
              answeredCount < questions.length ? setShowConfirm(true) : doSubmit()
            }
            className="px-4 py-2 rounded-[var(--th-radius)] bg-[var(--th-accent)] text-white text-sm font-semibold hover:bg-[var(--th-accent-hover)] disabled:opacity-50 transition-colors"
          >
            סיים מבחן
          </button>
        </div>
        {/* Animated progress bar */}
        <div className="h-1 bg-[var(--th-muted-bg)] w-full">
          <motion.div
            className="h-full bg-[var(--th-accent)] origin-start"
            animate={{ width: `${(answeredCount / questions.length) * 100}%` }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          />
        </div>
      </div>

      <div className="flex flex-1 flex-col items-center px-4 py-6 gap-6 max-w-2xl mx-auto w-full">
        {/* Question navigator — horizontal scroll on mobile */}
        <div className="w-full overflow-x-auto pb-1 snap-x snap-mandatory">
          <div className="flex gap-2 w-max mx-auto px-1">
            {questions.map((_, i) => (
              <button
                key={i}
                aria-label={`עבור לשאלה ${i + 1}`}
                aria-current={i === currentIdx ? "true" : undefined}
                className={`${navCircleClass(i)} snap-center shrink-0`}
                onClick={() => setCurrentIdx(i)}
              >
                {i + 1}
              </button>
            ))}
          </div>
        </div>

        {/* Question area */}
        <div className="w-full flex flex-col gap-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-[var(--th-muted)]">
              שאלה {currentIdx + 1} מתוך {questions.length}
            </span>
            <button
              onClick={() =>
                setMarkedForReview((prev) =>
                  prev.map((m, i) => (i === currentIdx ? !m : m))
                )
              }
              className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                markedForReview[currentIdx]
                  ? "bg-amber-200 border-amber-400 text-amber-900 dark:bg-amber-700 dark:border-amber-500 dark:text-amber-100"
                  : "border-[var(--th-border)] text-[var(--th-muted)] hover:bg-[var(--th-muted-bg)]"
              }`}
            >
              {markedForReview[currentIdx] ? "⚑ מסומן לחזרה" : "⚑ סמן לחזרה"}
            </button>
          </div>

          <div className="rounded-[var(--th-radius)] border border-[var(--th-border)] bg-[var(--th-card)] p-5 flex flex-col gap-4">
            {q.image && (
              <div className="flex justify-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={q.image}
                  alt={q.text}
                  className="max-h-48 object-contain rounded-lg"
                />
              </div>
            )}
            <p className="text-xl font-bold leading-relaxed">{q.text}</p>
            <div className="flex flex-col gap-2">
              {q.answers.map((answer, idx) => {
                const isSelected = answers[currentIdx] === idx;
                return (
                  <motion.button
                    key={idx}
                    onClick={(e) => {
                      addRipple(e, idx);
                      setAnswers((prev) =>
                        prev.map((a, i) => (i === currentIdx ? idx : a))
                      );
                    }}
                    whileTap={{ scale: 0.98 }}
                    className={`relative overflow-hidden w-full text-start px-4 py-3 rounded-[var(--th-radius)] border text-sm font-medium transition-colors ${
                      isSelected
                        ? "bg-[var(--th-accent)] border-[var(--th-accent)] text-white"
                        : "bg-[var(--th-card)] border-[var(--th-border)] hover:border-[var(--th-accent)] hover:bg-[var(--th-muted-bg)]"
                    }`}
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
                      <span className="font-bold me-2">{LABELS[idx]}.</span>
                      {answer}
                    </span>
                  </motion.button>
                );
              })}
            </div>
          </div>

          <div className="flex justify-between gap-3">
            <button
              disabled={currentIdx === 0}
              onClick={() => setCurrentIdx((i) => i - 1)}
              className="flex items-center gap-2 px-4 py-2 rounded-[var(--th-radius)] border border-[var(--th-border)] text-sm font-medium text-[var(--th-fg)] hover:bg-[var(--th-muted-bg)] hover:border-[var(--th-accent)] disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
            >
              <span className="text-xl font-bold leading-none text-[var(--th-accent)]">&#8594;</span>
              הקודמת
            </button>
            <button
              disabled={currentIdx === questions.length - 1}
              onClick={() => setCurrentIdx((i) => i + 1)}
              className="flex items-center gap-2 px-4 py-2 rounded-[var(--th-radius)] border border-[var(--th-border)] text-sm font-medium text-[var(--th-fg)] hover:bg-[var(--th-muted-bg)] hover:border-[var(--th-accent)] disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
            >
              הבאה
              <span className="text-xl font-bold leading-none text-[var(--th-accent)]">&#8592;</span>
            </button>
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-4 text-xs text-[var(--th-muted)] justify-center">
          <span className="flex items-center gap-1.5">
            <span className="w-4 h-4 rounded-full bg-[var(--th-muted-bg)] inline-block" /> לא נענתה
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-4 h-4 rounded-full bg-[var(--th-accent)] inline-block" /> נענתה
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-4 h-4 rounded-full bg-amber-200 dark:bg-amber-700 inline-block" /> מסומנת לחזרה
          </span>
        </div>
      </div>

      {/* Exit confirmation dialog */}
      {showExitConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4" role="dialog" aria-modal="true" aria-labelledby="exit-dialog-title">
          <div className="bg-[var(--th-card)] rounded-[var(--th-radius)] border border-[var(--th-border)] p-6 max-w-sm w-full flex flex-col gap-4">
            <h2 id="exit-dialog-title" className="text-xl font-bold">לצאת מהמבחן?</h2>
            <p className="text-[var(--th-muted)] text-sm">
              ההתקדמות שלך לא תישמר ויציאה מהמבחן תבטל את התשובות שסימנת.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowExitConfirm(false)}
                className="px-4 py-2 rounded-[var(--th-radius)] border border-[var(--th-border)] text-sm font-medium hover:bg-[var(--th-muted-bg)] transition-colors"
              >
                המשך מבחן
              </button>
              <button
                onClick={() => {
                  setShowExitConfirm(false);
                  router.push("/");
                }}
                className="px-4 py-2 rounded-[var(--th-radius)] bg-[var(--th-error)] text-white text-sm font-semibold hover:opacity-90 transition-opacity"
              >
                צא מהמבחן
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation dialog */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4" role="dialog" aria-modal="true" aria-labelledby="confirm-dialog-title">
          <div className="bg-[var(--th-card)] rounded-[var(--th-radius)] border border-[var(--th-border)] p-6 max-w-sm w-full flex flex-col gap-4">
            <h2 id="confirm-dialog-title" className="text-xl font-bold">לסיים את המבחן?</h2>
            <p className="text-[var(--th-muted)] text-sm">
              ענית על {answeredCount} מתוך {questions.length} שאלות.{" "}
              {questions.length - answeredCount} שאלות עדיין לא נענו.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowConfirm(false)}
                className="px-4 py-2 rounded-[var(--th-radius)] border border-[var(--th-border)] text-sm font-medium hover:bg-[var(--th-muted-bg)] transition-colors"
              >
                המשך מבחן
              </button>
              <button
                onClick={() => {
                  setShowConfirm(false);
                  doSubmit();
                }}
                className="px-4 py-2 rounded-[var(--th-radius)] bg-[var(--th-accent)] text-white text-sm font-semibold hover:bg-[var(--th-accent-hover)] transition-colors"
              >
                סיים בכל זאת
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
