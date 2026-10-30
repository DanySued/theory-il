"use client";

import Explanation from "@/components/Explanation";
import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";
import type { SuperMemoGrade } from "supermemo";
import { getDueCards, previewInterval, reviewCard } from "@/lib/srs";
import type { Question } from "@/components/QuestionCard";
import PageShell from "@/components/PageShell";
import SectionHead from "@/components/SectionHead";
import FocusMode from "@/components/FocusMode";
import FocusHeader from "@/components/FocusHeader";
import FocusActionBar, { focusPrimary } from "@/components/FocusActionBar";

const RATINGS = [
  { grade: 1 as SuperMemoGrade, label: "לא ידעתי", tone: "error" },
  { grade: 3 as SuperMemoGrade, label: "בערך", tone: "neutral" },
  { grade: 5 as SuperMemoGrade, label: "ידעתי", tone: "accent" },
] as const;

/** Next-review hint computed from the card's real SRS state. */
function intervalHint(days: number): string {
  if (days <= 0) return "שוב היום";
  if (days === 1) return "מחר";
  if (days === 2) return "בעוד יומיים";
  return `בעוד ${days} ימים`;
}

interface Props {
  questions: Question[];
}

export default function FlashcardRunner({ questions }: Props) {
  const [dueIds, setDueIds] = useState<string[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [reviewed, setReviewed] = useState(0);
  const [done, setDone] = useState(false);
  const [nextDate, setNextDate] = useState<string | null>(null);

  useEffect(() => {
    const due = getDueCards(questions.map((q) => q.id));
    // Shuffle
    const shuffled = [...due].sort(() => Math.random() - 0.5);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setDueIds(shuffled);
    if (shuffled.length === 0) setDone(true);
  }, [questions]);

  function handleRate(grade: SuperMemoGrade) {
    const id = dueIds[currentIdx];
    const card = reviewCard(id, grade);
    if (nextDate === null || card.dueDate < nextDate) {
      setNextDate(card.dueDate);
    }
    setReviewed((r) => r + 1);
    setFlipped(false);
    if (currentIdx + 1 >= dueIds.length) {
      setDone(true);
    } else {
      setCurrentIdx((i) => i + 1);
    }
  }

  // Keyboard shortcuts: Space/Enter to flip, 1/2/3 to rate when flipped
  useEffect(() => {
    function handler(e: KeyboardEvent) {
      if (done || dueIds.length === 0) return;
      const target = e.target as HTMLElement | null;
      if (target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA")) return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;

      if (e.key === " " || e.key === "Enter") {
        e.preventDefault();
        setFlipped((f) => !f);
      } else if (flipped) {
        if (e.key === "1") {
          e.preventDefault();
          handleRate(1 as SuperMemoGrade);
        } else if (e.key === "2") {
          e.preventDefault();
          handleRate(3 as SuperMemoGrade);
        } else if (e.key === "3") {
          e.preventDefault();
          handleRate(5 as SuperMemoGrade);
        }
      }
    }
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [flipped, done, dueIds, currentIdx]);

  if (done) {
    return (
      <PageShell showBack={false}>
        <div className="flex flex-col items-center text-center gap-4 py-8">
          <div className="text-4xl" aria-hidden>
            🎉
          </div>
          <SectionHead
            eyebrow={`${reviewed} כרטיסיות נסקרו`}
            title="סיימת!"
            subtitle={nextDate ? `הבא בתור: ${nextDate}` : undefined}
            align="center"
          />
          <Link
            href="/flashcards"
            className="mt-2 inline-flex items-center justify-center h-11 px-5 rounded-[var(--th-radius-lg)] border border-[var(--th-border)] text-sm font-medium hover:bg-[var(--th-muted-bg)] transition-colors"
          >
            חזרה לכרטיסיות
          </Link>
        </div>
      </PageShell>
    );
  }

  if (dueIds.length === 0)
    return (
      <PageShell showBack={false}>
        <div className="flex flex-col items-center text-center gap-4 py-8">
          <div className="text-5xl" aria-hidden>
            ✓
          </div>
          <SectionHead
            eyebrow="SRS"
            title="אין כרטיסיות לחזרה כרגע"
            subtitle="כל הכרטיסיות בנושא זה עודכנו. חזור מאוחר יותר."
            align="center"
          />
          <Link
            href="/flashcards"
            className="mt-2 inline-flex items-center justify-center h-11 px-5 rounded-[var(--th-radius-lg)] border border-[var(--th-border)] text-sm font-medium hover:bg-[var(--th-muted-bg)] transition-colors"
          >
            חזרה לכרטיסיות
          </Link>
        </div>
      </PageShell>
    );

  const q = questions.find((q) => q.id === dueIds[currentIdx])!;
  const displayText = q.text;
  const displayAnswer = q.answers[q.correctIndex];

  return (
    <main
      className="flex flex-1 flex-col items-center pb-[calc(2rem+var(--th-safe-b))] sm:py-8 gap-4 sm:gap-6"
      style={{ paddingInline: "var(--th-page-px)" }}
    >
      <FocusMode />
      <FocusHeader
        bleed
        back={{ label: "חזרה לכרטיסיות", href: "/flashcards" }}
        title={q.topic}
        subtitle={`כרטיס ${currentIdx + 1} מתוך ${dueIds.length} להיום`}
        progress={currentIdx / dueIds.length}
      />

      <div className="hidden sm:flex w-full max-w-lg items-center justify-between">
        <Link
          href="/flashcards"
          className="inline-flex items-center gap-1.5 h-8 px-3 rounded-[var(--th-radius-sm)] text-sm text-[var(--th-muted)] hover:text-[var(--th-fg)] hover:bg-[var(--th-muted-bg)] transition-colors border border-[var(--th-border)]"
        >
          <span aria-hidden="true">&#8594;</span>
          חזרה
        </Link>
        <h1 className="text-sm font-semibold text-[var(--th-fg-soft)]">
          כרטיסיות · {q.topic}
        </h1>
        <span className="text-xs text-[var(--th-muted)] tabular-nums font-mono tracking-wide">
          {currentIdx + 1} / {dueIds.length}
        </span>
      </div>

      {/* Progress bar */}
      <div className="hidden sm:block w-full max-w-lg h-1.5 bg-[var(--th-muted-bg)] rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-[var(--th-accent)] rounded-full"
          animate={{ width: `${(currentIdx / dueIds.length) * 100}%` }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        />
      </div>

      {/* Flip card */}
      <div
        role="button"
        tabIndex={0}
        aria-label={flipped ? "הפוך חזרה לשאלה" : "הצג תשובה"}
        className="w-full max-w-lg cursor-pointer rounded-3xl sm:rounded-[var(--th-radius-lg)]"
        style={{ perspective: 1200 }}
        onClick={() => setFlipped((f) => !f)}
      >
        <motion.div
          animate={{ rotateY: flipped ? 180 : 0 }}
          transition={{ duration: 0.45, ease: [0.4, 0, 0.2, 1] }}
          className="th-flashcard"
          style={{ transformStyle: "preserve-3d", position: "relative", minHeight: 260 }}
        >
          {/* Front */}
          <div
            className="absolute inset-0 backface-hidden rounded-3xl sm:rounded-[var(--th-radius-lg)] border border-[var(--th-border)] bg-[var(--th-card)] shadow-[var(--th-shadow-lg)] sm:shadow-none p-5 sm:p-8 flex flex-col justify-start sm:justify-center gap-4 sm:gap-3"
          >
            <span className="sm:hidden self-start text-xs font-semibold px-2.5 py-1 rounded-full bg-[var(--th-muted-bg)] text-[var(--th-muted-strong)]">
              שאלה
            </span>
            {q.image && (
              <div className="flex justify-center mb-2">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={q.image} alt="" decoding="async" className="max-h-32 object-contain rounded-lg" />
              </div>
            )}
            <p className="text-xl font-bold leading-normal sm:leading-relaxed">{displayText}</p>
            <p className="text-[13px] sm:text-xs text-[var(--th-muted)] mt-auto text-center sm:text-start">
              <span className="sm:hidden">הקש על הכרטיס כדי להפוך</span>
              <span className="hidden sm:inline">לחץ להצגת התשובה · רווח / Enter</span>
            </p>
          </div>

          {/* Back (phones repeat the question above the answer, as in the design) */}
          <div
            className="absolute inset-0 backface-hidden rounded-3xl sm:rounded-[var(--th-radius-lg)] border border-[var(--th-success)] bg-[var(--th-card)] shadow-[var(--th-shadow-lg)] sm:shadow-none p-5 sm:p-8 flex flex-col justify-start sm:justify-center gap-4 overflow-y-auto"
            style={{ transform: "rotateY(180deg)" }}
          >
            <div className="sm:hidden flex flex-col gap-3">
              <span className="self-start text-xs font-semibold px-2.5 py-1 rounded-full bg-[var(--th-muted-bg)] text-[var(--th-muted-strong)]">
                שאלה
              </span>
              {q.image && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={q.image} alt="" decoding="async" className="self-center max-h-24 object-contain rounded-lg" />
              )}
              <p className="text-base font-bold leading-normal text-[var(--th-fg-soft)]">{displayText}</p>
              <div className="h-px bg-[var(--th-border)]" />
              <span className="self-start text-xs font-semibold px-2.5 py-1 rounded-full bg-[var(--th-success-soft)] text-[var(--th-success)]">
                תשובה
              </span>
            </div>
            <p className="text-[22px] sm:text-xl leading-snug font-extrabold sm:font-bold text-[var(--th-success)]">{displayAnswer}</p>
            {flipped && <Explanation question={q} />}
          </div>
        </motion.div>
      </div>

      {/* Rating buttons (only shown when flipped) */}
      <AnimatePresence>
        {flipped && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.2 }}
            className="hidden sm:flex gap-3 w-full max-w-lg"
          >
            <button
              onClick={() => handleRate(1 as SuperMemoGrade)}
              className="flex-1 py-3 rounded-[var(--th-radius-lg)] border border-[var(--th-error)] text-[var(--th-error)] text-sm font-semibold hover:bg-[var(--th-error-soft)] transition-colors flex items-center justify-center gap-2"
            >
              לא ידעתי
              <kbd className="hidden sm:inline text-[0.65rem] font-mono opacity-60 border border-current rounded px-1">1</kbd>
            </button>
            <button
              onClick={() => handleRate(3 as SuperMemoGrade)}
              className="flex-1 py-3 rounded-[var(--th-radius-lg)] border border-[var(--th-border)] text-[var(--th-fg)] text-sm font-semibold hover:bg-[var(--th-muted-bg)] transition-colors flex items-center justify-center gap-2"
            >
              בערך
              <kbd className="hidden sm:inline text-[0.65rem] font-mono opacity-60 border border-current rounded px-1">2</kbd>
            </button>
            <button
              onClick={() => handleRate(5 as SuperMemoGrade)}
              className="flex-1 py-3 rounded-[var(--th-radius-lg)] border border-[var(--th-success)] text-[var(--th-success)] text-sm font-semibold hover:bg-[var(--th-success-soft)] transition-colors flex items-center justify-center gap-2"
            >
              ידעתי
              <kbd className="hidden sm:inline text-[0.65rem] font-mono opacity-60 border border-current rounded px-1">3</kbd>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Phone bar: flip, then rate (grades 1/3/5, hints from the card's real SRS state) */}
      <FocusActionBar>
        {flipped ? (
          <div className="flex-1 flex flex-col gap-2">
            <span className="text-[13px] text-center text-[var(--th-muted-strong)]">כמה טוב ידעת?</span>
            <div className="grid grid-cols-3 gap-2">
              {RATINGS.map((r) => (
                <button
                  key={r.grade}
                  type="button"
                  onClick={() => handleRate(r.grade)}
                  className={`h-14 rounded-[14px] inline-flex flex-col items-center justify-center font-bold leading-tight text-base transition-colors ${
                    r.tone === "error"
                      ? "border border-[var(--th-error)] bg-[var(--th-error-soft)] text-[var(--th-error)]"
                      : r.tone === "accent"
                        ? "bg-[var(--th-accent)] text-[var(--th-on-accent)]"
                        : "border border-[var(--th-border-strong)] bg-[var(--th-card)] text-[var(--th-fg)]"
                  }`}
                >
                  {r.label}
                  <span className="text-[11px] font-medium opacity-85">
                    {intervalHint(previewInterval(q.id, r.grade))}
                  </span>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <button type="button" onClick={() => setFlipped(true)} className={focusPrimary}>
            הצג תשובה
          </button>
        )}
      </FocusActionBar>
    </main>
  );
}
