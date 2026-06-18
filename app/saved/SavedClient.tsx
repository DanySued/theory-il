"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import QuestionCard, { type Question } from "@/components/QuestionCard";
import ProgressBar from "@/components/ProgressBar";
import SectionHead from "@/components/SectionHead";
import QuestionSkeleton from "@/components/QuestionSkeleton";
import { loadCorpus } from "@/lib/data/corpus";
import { getBookmarks } from "@/lib/storage";

export default function SavedClient() {
  const [savedIds, setSavedIds] = useState<Set<string> | null>(null);
  const [allQuestions, setAllQuestions] = useState<Question[] | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const [showAnswer, setShowAnswer] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSavedIds(getBookmarks());
    loadCorpus().then(setAllQuestions);
  }, []);

  const questions = useMemo(() => {
    if (!savedIds || !allQuestions) return [];
    return allQuestions.filter((q) => savedIds.has(q.id));
  }, [savedIds, allQuestions]);

  // If user un-bookmarks the current question, refresh the list and clamp the index
  // so we don't fall off the end.
  useEffect(() => {
    if (currentIndex >= questions.length && questions.length > 0) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setCurrentIndex(questions.length - 1);
    }
  }, [questions.length, currentIndex]);

  const goTo = useCallback(
    (idx: number) => {
      if (questions.length === 0) return;
      const clamped = Math.max(0, Math.min(questions.length - 1, idx));
      setDirection(clamped >= currentIndex ? 1 : -1);
      setCurrentIndex(clamped);
      setShowAnswer(false);
      setSelectedAnswer(null);
    },
    [questions.length, currentIndex]
  );

  const handleReveal = useCallback(() => setShowAnswer(true), []);
  const handleAnswer = useCallback((idx: number) => {
    setSelectedAnswer(idx);
    setShowAnswer(true);
  }, []);
  const handleNext = useCallback(() => goTo(currentIndex + 1), [currentIndex, goTo]);
  const handlePrev = useCallback(() => goTo(currentIndex - 1), [currentIndex, goTo]);

  if (savedIds === null || allQuestions === null) {
    return (
      <>
        <QuestionSkeleton />
      </>
    );
  }

  if (questions.length === 0) {
    return (
      <>
        <div className="w-full text-center py-12 flex flex-col items-center gap-4">
          <div className="text-4xl" aria-hidden>
            ★
          </div>
          <SectionHead
            eyebrow="שמורות"
            title="אין כאן שאלות עדיין"
            subtitle="לחץ על הכוכב ליד שאלה כדי לשמור אותה לחזרה מאוחרת."
            align="center"
          />
          <div className="flex gap-3 mt-2">
            <Link
              href="/study"
              className="inline-flex items-center justify-center h-11 px-5 rounded-[var(--th-radius-lg)] bg-[var(--th-accent)] text-white text-sm font-semibold hover:bg-[var(--th-accent-hover)] transition-colors"
            >
              ללימוד לפי נושא
            </Link>
            <Link
              href="/progress"
              className="inline-flex items-center justify-center h-11 px-5 rounded-[var(--th-radius-lg)] border border-[var(--th-border)] text-sm font-medium hover:bg-[var(--th-muted-bg)] transition-colors"
            >
              ההתקדמות שלי
            </Link>
          </div>
        </div>
      </>
    );
  }

  const safeIndex = Math.min(currentIndex, questions.length - 1);

  return (
    <>
      <SectionHead
        eyebrow="שמורות"
        title="השאלות שלך"
        subtitle={`${questions.length} שאלות שמורות לחזרה — מסומנות בכוכב.`}
      />
      <ProgressBar current={safeIndex + 1} total={questions.length} />
      <QuestionCard
        question={questions[safeIndex]}
        showAnswer={showAnswer}
        selectedAnswer={selectedAnswer}
        onReveal={handleReveal}
        onAnswer={handleAnswer}
        onNext={handleNext}
        onPrev={handlePrev}
        currentIndex={safeIndex}
        total={questions.length}
        direction={direction}
        trackStats
      />
    </>
  );
}
