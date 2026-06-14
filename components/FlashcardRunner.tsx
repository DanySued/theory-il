"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";
import type { SuperMemoGrade } from "supermemo";
import { getDueCards, reviewCard } from "@/lib/srs";
import type { Question } from "@/components/QuestionCard";

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

  if (done) {
    return (
      <main className="flex flex-1 flex-col items-center justify-center px-4 py-8 gap-6 text-center">
        <div className="text-4xl">🎉</div>
        <h1 className="th-page-title">סיימת!</h1>
        <p className="text-[var(--th-muted)]">
          {`עברת על ${reviewed} כרטיסיות היום.`}
        </p>
        {nextDate && (
          <p className="text-sm text-[var(--th-muted)]">
            {`הבא: ${nextDate}`}
          </p>
        )}
        <Link
          href="/flashcards"
          className="mt-4 inline-flex items-center justify-center h-10 px-4 rounded-[var(--th-radius)] border border-[var(--th-border)] text-sm font-medium hover:bg-[var(--th-muted-bg)] transition-colors"
        >
          חזרה לכרטיסיות
        </Link>
      </main>
    );
  }

  if (dueIds.length === 0)
    return (
      <main className="flex flex-1 flex-col items-center justify-center px-4 py-8 gap-6 text-center">
        <div className="text-5xl">✓</div>
        <h1 className="th-page-title">אין כרטיסיות לחזרה כרגע</h1>
        <p className="text-[var(--th-muted)] text-sm">כל הכרטיסיות בנושא זה עודכנו. חזור מאוחר יותר.</p>
        <Link href="/flashcards" className="mt-2 inline-flex items-center justify-center h-10 px-4 rounded-[var(--th-radius)] border border-[var(--th-border)] text-sm font-medium hover:bg-[var(--th-muted-bg)] transition-colors">
          חזרה לכרטיסיות
        </Link>
      </main>
    );

  const q = questions.find((q) => q.id === dueIds[currentIdx])!;
  const displayText = q.text;
  const displayAnswer = q.answers[q.correctIndex];

  return (
    <main className="flex flex-1 flex-col items-center px-4 py-8 gap-6">
      <div className="w-full max-w-lg flex items-center justify-between">
        <Link
          href="/flashcards"
          className="flex items-center gap-2 text-sm font-semibold text-[var(--th-accent)] hover:opacity-80 transition-opacity"
        >
          <span className="text-base font-bold leading-none">&#8594;</span>
          חזרה לכרטיסיות
        </Link>
        <span className="text-xs text-[var(--th-muted)] tabular-nums font-mono tracking-wide">
          {currentIdx + 1} / {dueIds.length}
        </span>
      </div>

      {/* Progress bar */}
      <div className="w-full max-w-lg h-1.5 bg-[var(--th-muted-bg)] rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-[var(--th-accent)] rounded-full"
          animate={{ width: `${(currentIdx / dueIds.length) * 100}%` }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        />
      </div>

      {/* Flip card */}
      <div
        className="w-full max-w-lg cursor-pointer"
        style={{ perspective: 1200 }}
        onClick={() => setFlipped((f) => !f)}
      >
        <motion.div
          animate={{ rotateY: flipped ? 180 : 0 }}
          transition={{ duration: 0.45, ease: [0.4, 0, 0.2, 1] }}
          style={{ transformStyle: "preserve-3d", position: "relative", minHeight: 260 }}
        >
          {/* Front */}
          <div
            className="absolute inset-0 backface-hidden rounded-[var(--th-radius-lg)] border border-[var(--th-border)] bg-[var(--th-card)] p-8 flex flex-col justify-center gap-3"
          >
            {q.image && (
              <div className="flex justify-center mb-2">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={q.image} alt="" className="max-h-32 object-contain rounded-lg" />
              </div>
            )}
            <p className="text-xl font-bold leading-relaxed">{displayText}</p>
            <p className="text-xs text-[var(--th-muted)] mt-auto">
              לחץ להצגת התשובה
            </p>
          </div>

          {/* Back */}
          <div
            className="absolute inset-0 backface-hidden rounded-[var(--th-radius-lg)] border border-[var(--th-success)] bg-[var(--th-card)] p-8 flex flex-col justify-center gap-4"
            style={{ transform: "rotateY(180deg)" }}
          >
            <p className="text-xl font-bold text-[var(--th-success)]">{displayAnswer}</p>
            {q.explanation && (
              <p className="text-sm text-[var(--th-muted)] leading-relaxed">{q.explanation}</p>
            )}
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
            className="flex gap-3 w-full max-w-lg"
          >
            <button
              onClick={() => handleRate(1 as SuperMemoGrade)}
              className="flex-1 py-3 rounded-[var(--th-radius)] border border-[var(--th-error)] text-[var(--th-error)] text-sm font-semibold hover:bg-[var(--th-error-soft)] transition-colors"
            >
              לא ידעתי
            </button>
            <button
              onClick={() => handleRate(3 as SuperMemoGrade)}
              className="flex-1 py-3 rounded-[var(--th-radius)] border border-[var(--th-border)] text-[var(--th-fg)] text-sm font-semibold hover:bg-[var(--th-muted-bg)] transition-colors"
            >
              בערך
            </button>
            <button
              onClick={() => handleRate(5 as SuperMemoGrade)}
              className="flex-1 py-3 rounded-[var(--th-radius)] border border-[var(--th-success)] text-[var(--th-success)] text-sm font-semibold hover:bg-[var(--th-success-soft)] transition-colors"
            >
              ידעתי
            </button>
          </motion.div>
        )}
      </AnimatePresence>

    </main>
  );
}
