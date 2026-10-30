"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import { ChevronLeft, ChevronRight, Flag } from "lucide-react";
import type { Question } from "@/components/QuestionCard";
import { saveAttempt, generateId } from "@/lib/storage";
import { LABELS } from "@/lib/constants";
import { useRipple } from "@/hooks/useRipple";
import ConfirmDialog from "@/components/ConfirmDialog";
import FocusHeader from "@/components/FocusHeader";
import FocusActionBar, { focusBase, focusIcon, focusPrimary } from "@/components/FocusActionBar";

const DEFAULT_EXAM_DURATION = 40 * 60;
const SECONDS_PER_QUESTION = 80; // matches the official 30-question / 40-minute ratio

function formatTime(s: number): string {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
}

export default function ExamRunner({
  questions,
  noTimer = false,
  durationSeconds,
}: {
  questions: Question[];
  noTimer?: boolean;
  durationSeconds?: number;
}) {
  const router = useRouter();
  const [examId] = useState(() => generateId());
  const [startedAt] = useState(() => Date.now());

  // Auto-scale timer when caller doesn't specify: keep official 30q/40min ratio.
  const examDuration =
    durationSeconds ??
    (questions.length === 30 ? DEFAULT_EXAM_DURATION : questions.length * SECONDS_PER_QUESTION);

  const { ripples, addRipple } = useRipple();

  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<(number | null)[]>(() =>
    new Array(questions.length).fill(null)
  );
  const [markedForReview, setMarkedForReview] = useState<boolean[]>(() =>
    new Array(questions.length).fill(false)
  );
  const [secondsLeft, setSecondsLeft] = useState(examDuration);
  const [submitted, setSubmitted] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showExitConfirm, setShowExitConfirm] = useState(false);

  // Refs so the timer callback always reads the latest state
  const closeConfirm = useCallback(() => setShowConfirm(false), []);
  const closeExitConfirm = useCallback(() => setShowExitConfirm(false), []);

  const answersRef = useRef(answers);
  const markedRef = useRef(markedForReview);
  const secondsRef = useRef(examDuration);
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
  const nextImage = questions[currentIdx + 1]?.image;
  useEffect(() => {
    if (!nextImage) return;
    const img = new Image();
    img.src = nextImage;
  }, [nextImage]);
  const answeredCount = useMemo(() => answers.filter((a) => a !== null).length, [answers]);
  const markedCount = markedForReview.filter(Boolean).length;
  const isLowTime = secondsLeft < 5 * 60;
  const isLastQuestion = currentIdx === questions.length - 1;

  const requestSubmit = () =>
    answeredCount < questions.length || markedForReview.some(Boolean) ? setShowConfirm(true) : doSubmit();
  const toggleMark = () =>
    setMarkedForReview((prev) => prev.map((m, i) => (i === currentIdx ? !m : m)));
  const selectAnswer = (idx: number) =>
    setAnswers((prev) => prev.map((a, i) => (i === currentIdx ? idx : a)));

  // Phone question map: keep the current chip in view. Scroll the strip itself (not
  // scrollIntoView) so the page never jumps, whatever the RTL scrollLeft convention.
  const stripRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const strip = stripRef.current;
    const chip = strip?.querySelector<HTMLElement>('[aria-current="step"]');
    if (!strip || !chip) return;
    const s = strip.getBoundingClientRect();
    const c = chip.getBoundingClientRect();
    strip.scrollBy({ left: c.left + c.width / 2 - (s.left + s.width / 2), behavior: "smooth" });
  }, [currentIdx]);

  // Keyboard shortcuts: arrows (prev/next), 1-4 (answer), M (mark for review)
  useEffect(() => {
    function handler(e: KeyboardEvent) {
      if (submitted || showConfirm || showExitConfirm) return;
      const target = e.target as HTMLElement | null;
      if (target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA")) return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;

      // In RTL, ArrowRight is "previous" visually (right = back), ArrowLeft is "next"
      if (e.key === "ArrowRight") {
        e.preventDefault();
        setCurrentIdx((i) => Math.max(0, i - 1));
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        setCurrentIdx((i) => Math.min(questions.length - 1, i + 1));
      } else if (e.key === "m" || e.key === "M") {
        e.preventDefault();
        setMarkedForReview((prev) => prev.map((m, i) => (i === currentIdx ? !m : m)));
      } else if (["1", "2", "3", "4"].includes(e.key)) {
        const idx = parseInt(e.key, 10) - 1;
        if (idx < questions[currentIdx].answers.length) {
          e.preventDefault();
          setAnswers((prev) => prev.map((a, i) => (i === currentIdx ? idx : a)));
        }
      }
    }
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [currentIdx, questions, submitted, showConfirm, showExitConfirm]);

  function chipClass(i: number): string {
    const base =
      "w-11 h-11 shrink-0 snap-center rounded-xl text-[15px] tabular-nums transition-colors ";
    if (i === currentIdx)
      return base + "border-2 border-[var(--th-accent)] bg-[var(--th-card)] text-[var(--th-fg)] font-extrabold";
    if (markedForReview[i])
      return base + "border border-[var(--th-marked-border)] bg-[var(--th-marked-bg)] text-[var(--th-marked-fg)] font-bold";
    if (answers[i] !== null)
      return base + "bg-[var(--th-accent-soft)] text-[var(--th-accent)] font-bold";
    return base + "border border-[var(--th-border)] bg-[var(--th-card)] text-[var(--th-muted)] font-semibold";
  }

  function chipLabel(i: number): string {
    const parts = [`שאלה ${i + 1}`];
    if (i === currentIdx) parts.push("נוכחית");
    if (answers[i] !== null) parts.push("נענתה");
    if (markedForReview[i]) parts.push("מסומנת לחזרה");
    return parts.join(", ");
  }

  function navCircleClass(i: number): string {
    const isAnswered = answers[i] !== null;
    const isMarked = markedForReview[i];
    const isCurrent = i === currentIdx;
    let cls =
      "w-8 h-8 rounded-full text-xs font-bold flex items-center justify-center cursor-pointer transition-all border-2 ";
    cls += isCurrent ? "border-[var(--th-accent)] scale-110 " : "border-transparent ";
    if (isMarked && isAnswered) cls += "bg-[var(--th-marked-bg-strong)] text-[var(--th-marked-fg-strong)] ";
    else if (isMarked) cls += "bg-[var(--th-marked-bg)] text-[var(--th-marked-fg)] ";
    else if (isAnswered) cls += "bg-[var(--th-accent)] text-[var(--th-on-accent)] ";
    else cls += "bg-[var(--th-muted-bg)] text-[var(--th-muted)] ";
    return cls;
  }

  return (
    <main className="flex flex-1 flex-col">
      {/* Phone top bar: exit · timer · submit */}
      <FocusHeader
        back={{ label: "יציאה מהמבחן", icon: "close", onClick: () => setShowExitConfirm(true) }}
        center={
          <div className="flex-1 flex justify-center">
            {noTimer ? (
              <span className="text-[15px] font-bold">
                {answeredCount}/{questions.length} נענו
              </span>
            ) : (
              <span
                role="timer"
                dir="ltr"
                className={`inline-flex items-center h-[34px] px-3.5 rounded-full border text-[17px] font-bold tabular-nums ${
                  isLowTime
                    ? "border-[var(--th-error)] bg-[var(--th-error-soft)] text-[var(--th-error)]"
                    : "border-[var(--th-border)] bg-[var(--th-muted-bg)] text-[var(--th-fg)]"
                }`}
              >
                {formatTime(secondsLeft)}
              </span>
            )}
          </div>
        }
        trailing={
          <button
            type="button"
            disabled={submitted}
            onClick={requestSubmit}
            className="shrink-0 h-11 px-3.5 me-1 rounded-xl border border-[var(--th-border-strong)] text-[15px] font-bold text-[var(--th-fg)] active:bg-[var(--th-muted-bg)] disabled:opacity-50"
          >
            הגשה
          </button>
        }
      />

      {/* Sticky top bar (≥sm) */}
      <div className="hidden sm:block sticky top-0 z-10 bg-[var(--th-card)] border-b border-[var(--th-border)]">
        <div
          className="flex items-center justify-between gap-4 py-3"
          style={{ paddingInline: "var(--th-page-px)" }}
        >
          <button
            type="button"
            onClick={() => setShowExitConfirm(true)}
            aria-label="יציאה מהמבחן"
            className="inline-flex items-center gap-1.5 h-8 px-3 rounded-[var(--th-radius-sm)] text-sm text-[var(--th-muted)] hover:text-[var(--th-fg)] hover:bg-[var(--th-muted-bg)] transition-colors border border-[var(--th-border)]"
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
            onClick={requestSubmit}
            className="h-10 px-4 rounded-[var(--th-radius-lg)] bg-[var(--th-accent)] text-[var(--th-on-accent)] text-sm font-semibold hover:bg-[var(--th-accent-hover)] disabled:opacity-50 transition-colors"
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

      <div
        className="flex flex-1 flex-col items-center pt-3 pb-4 sm:py-8 gap-3 sm:gap-8 max-w-2xl mx-auto w-full min-w-0"
        style={{ paddingInline: "var(--th-page-px)" }}
      >
        {/* Phone status row + question map */}
        <div className="sm:hidden w-full flex items-center justify-between gap-3">
          <span className="text-[15px] font-bold">
            שאלה {currentIdx + 1} מתוך {questions.length}
          </span>
          <span className="text-[13px] text-[var(--th-muted)]">
            {answeredCount} נענו · {markedCount} {markedCount === 1 ? "מסומנת" : "מסומנות"}
          </span>
        </div>
        <div
          ref={stripRef}
          role="group"
          aria-label="מפת שאלות"
          className="sm:hidden self-stretch -mx-[var(--th-page-px)] flex gap-1.5 overflow-x-auto snap-x snap-mandatory scroll-px-4 px-4 py-0.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {questions.map((_, i) => (
            <button
              key={i}
              type="button"
              aria-label={chipLabel(i)}
              aria-current={i === currentIdx ? "step" : undefined}
              className={chipClass(i)}
              onClick={() => setCurrentIdx(i)}
            >
              {i + 1}
            </button>
          ))}
        </div>

        {/* Question navigator (≥sm) */}
        <div className="hidden sm:block w-full overflow-x-auto pb-1 snap-x snap-mandatory">
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
          <div className="hidden sm:flex items-center justify-between text-sm">
            <span className="text-[var(--th-muted)]">
              שאלה {currentIdx + 1} מתוך {questions.length}
            </span>
            <button
              onClick={toggleMark}
              className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                markedForReview[currentIdx]
                  ? "bg-[var(--th-marked-bg)] border-[var(--th-marked-border)] text-[var(--th-marked-fg)]"
                  : "border-[var(--th-border)] text-[var(--th-muted)] hover:bg-[var(--th-muted-bg)]"
              }`}
            >
              {markedForReview[currentIdx] ? "⚑ מסומן לחזרה" : "⚑ סמן לחזרה"}
            </button>
          </div>

          <div className="rounded-[20px] sm:rounded-[var(--th-radius-lg)] border border-[var(--th-border)] bg-[var(--th-card)] p-4 sm:p-5 flex flex-col gap-3.5 sm:gap-4">
            {q.image && (
              <div className="flex justify-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={q.image}
                  alt="תמונה לשאלה" decoding="async"
                  className="max-h-40 sm:max-h-48 object-contain rounded-lg"
                />
              </div>
            )}
            <p className="text-[19px] sm:text-xl font-bold leading-normal sm:leading-relaxed">{q.text}</p>
            <div role="radiogroup" aria-label={`תשובות לשאלה ${currentIdx + 1}`} className="flex flex-col gap-2">
              {q.answers.map((answer, idx) => {
                const isSelected = answers[currentIdx] === idx;
                return (
                  <motion.button
                    key={idx}
                    type="button"
                    role="radio"
                    aria-checked={isSelected}
                    onClick={(e) => {
                      addRipple(e, idx);
                      selectAnswer(idx);
                    }}
                    whileTap={{ scale: 0.98 }}
                    // Phones: 56px radio rows (2px accent border + soft fill when chosen);
                    // ≥sm keeps the solid accent selection.
                    className={`relative overflow-hidden w-full min-h-14 sm:min-h-0 flex sm:block items-center gap-2.5 text-start px-3.5 sm:px-4 py-3 rounded-[14px] sm:rounded-[var(--th-radius)] text-base sm:text-sm leading-snug sm:leading-normal font-medium transition-colors ${
                      isSelected
                        ? "border-2 sm:border bg-[var(--th-accent-soft)] sm:bg-[var(--th-accent)] border-[var(--th-accent)] text-[var(--th-fg)] sm:text-[var(--th-on-accent)] font-semibold sm:font-medium"
                        : "border bg-[var(--th-card)] border-[var(--th-border)] text-[var(--th-fg-soft)] sm:text-[var(--th-fg)] hover:border-[var(--th-accent)] hover:bg-[var(--th-muted-bg)]"
                    }`}
                  >
                    <span
                      aria-hidden
                      className={`sm:hidden relative shrink-0 w-5 h-5 rounded-full box-border ${
                        isSelected ? "border-[6px] border-[var(--th-accent)]" : "border-2 border-[var(--th-border-strong)]"
                      }`}
                    />
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
                      <span className="hidden sm:inline font-bold me-2">{LABELS[idx]}.</span>
                      {answer}
                    </span>
                  </motion.button>
                );
              })}
            </div>
          </div>

          <div className="hidden sm:flex justify-between gap-3">
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

        {/* Legend (≥sm; phone chips carry their state in their labels) */}
        <div className="hidden sm:flex flex-wrap gap-4 text-xs text-[var(--th-muted)] justify-center">
          <span className="flex items-center gap-1.5">
            <span className="w-4 h-4 rounded-full bg-[var(--th-muted-bg)] inline-block" /> לא נענתה
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-4 h-4 rounded-full bg-[var(--th-accent)] inline-block" /> נענתה
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-4 h-4 rounded-full bg-[var(--th-marked-bg)] inline-block" /> מסומנת לחזרה
          </span>
        </div>

        {/* Keyboard hint */}
        <p className="text-[0.7rem] text-[var(--th-muted)] text-center hidden sm:block" aria-hidden>
          קיצורי מקלדת: ← → לניווט · 1-4 לבחירת תשובה · M לסמן לחזרה
        </p>
      </div>

      {/* Phone bottom bar: prev · mark · next (submit on the last question) */}
      <FocusActionBar>
        <button
          type="button"
          disabled={currentIdx === 0}
          onClick={() => setCurrentIdx((i) => i - 1)}
          aria-label="השאלה הקודמת"
          className={focusIcon}
        >
          <ChevronRight size={24} aria-hidden />
        </button>
        <button
          type="button"
          aria-pressed={markedForReview[currentIdx]}
          onClick={toggleMark}
          className={`${focusBase} shrink-0 px-3.5 text-[15px] font-semibold border ${
            markedForReview[currentIdx]
              ? "bg-[var(--th-marked-bg)] border-[var(--th-marked-border)] text-[var(--th-marked-fg)]"
              : "bg-[var(--th-card)] border-[var(--th-border-strong)] text-[var(--th-marked-fg)] active:bg-[var(--th-muted-bg)]"
          }`}
        >
          <Flag
            size={18}
            aria-hidden
            className={markedForReview[currentIdx] ? "" : "text-[var(--th-marked-border)]"}
            fill={markedForReview[currentIdx] ? "currentColor" : "none"}
          />
          {markedForReview[currentIdx] ? "מסומנת" : "סמן"}
        </button>
        {isLastQuestion ? (
          <button type="button" disabled={submitted} onClick={requestSubmit} className={focusPrimary}>
            הגשה
          </button>
        ) : (
          <button type="button" onClick={() => setCurrentIdx((i) => i + 1)} className={focusPrimary}>
            הבאה
            <ChevronLeft size={20} strokeWidth={2.2} aria-hidden />
          </button>
        )}
      </FocusActionBar>

      {showExitConfirm && (
        <ConfirmDialog
          title="לצאת מהמבחן?"
          cancelLabel="המשך מבחן"
          confirmLabel="צא מהמבחן"
          tone="danger"
          onCancel={closeExitConfirm}
          onConfirm={() => {
            setShowExitConfirm(false);
            router.push("/");
          }}
        >
          ההתקדמות שלך לא תישמר ויציאה מהמבחן תבטל את התשובות שסימנת.
        </ConfirmDialog>
      )}

      {showConfirm && (
        <ConfirmDialog
          title="לסיים את המבחן?"
          cancelLabel="המשך מבחן"
          confirmLabel="סיים בכל זאת"
          onCancel={closeConfirm}
          onConfirm={() => {
            setShowConfirm(false);
            doSubmit();
          }}
        >
          ענית על {answeredCount} מתוך {questions.length} שאלות.
          {answeredCount < questions.length && (
            <> {questions.length - answeredCount} שאלות עדיין לא נענו.</>
          )}
          {markedForReview.some(Boolean) && (
            <> סימנת {markedForReview.filter(Boolean).length} שאלות לבדיקה חוזרת.</>
          )}
        </ConfirmDialog>
      )}
    </main>
  );
}
