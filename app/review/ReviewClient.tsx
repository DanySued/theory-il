"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import QuestionCard, { type Question } from "@/components/QuestionCard";
import ProgressBar from "@/components/ProgressBar";
import SectionHead from "@/components/SectionHead";
import QuestionSkeleton from "@/components/QuestionSkeleton";
import { loadCorpus } from "@/lib/data/corpus";
import { getQStats, getBookmarks, updateStreak } from "@/lib/storage";
import { rankQuestions, reviewDeckSummary } from "@/lib/review";

const DECK_SIZE = 20;

interface Deck {
  questions: Question[];
  summary: { total: number; wrongCount: number; newCount: number; bookmarkCount: number };
}

export default function ReviewClient() {
  const [deck, setDeck] = useState<Deck | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const [showAnswer, setShowAnswer] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [done, setDone] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);

  useEffect(() => {
    const stats = getQStats();
    const bookmarks = getBookmarks();
    loadCorpus().then((allQuestions) => {
      const questions = rankQuestions({ questions: allQuestions, stats, bookmarks }, DECK_SIZE);
      const summary = reviewDeckSummary(questions, stats, bookmarks);
      setDeck({ questions, summary });
    });
    updateStreak();
  }, []);

  const goTo = useCallback(
    (idx: number) => {
      if (!deck) return;
      const clamped = Math.max(0, Math.min(deck.questions.length - 1, idx));
      setDirection(clamped >= currentIndex ? 1 : -1);
      setCurrentIndex(clamped);
      setShowAnswer(false);
      setSelectedAnswer(null);
    },
    [deck, currentIndex]
  );

  const handleReveal = useCallback(() => setShowAnswer(true), []);

  const handleAnswer = useCallback(
    (idx: number) => {
      if (!deck) return;
      const q = deck.questions[currentIndex];
      if (idx === q.correctIndex) setCorrectCount((c) => c + 1);
      setSelectedAnswer(idx);
      setShowAnswer(true);
    },
    [deck, currentIndex]
  );

  const handleNext = useCallback(() => {
    if (!deck) return;
    if (currentIndex + 1 >= deck.questions.length) {
      setDone(true);
      return;
    }
    goTo(currentIndex + 1);
  }, [deck, currentIndex, goTo]);

  const handlePrev = useCallback(() => goTo(currentIndex - 1), [currentIndex, goTo]);

  const accuracyPct = useMemo(() => {
    if (currentIndex === 0 && !showAnswer) return null;
    const answered = currentIndex + (showAnswer ? 1 : 0);
    return answered > 0 ? Math.round((correctCount / answered) * 100) : null;
  }, [correctCount, currentIndex, showAnswer]);

  if (deck === null) {
    return (
      <>
        <QuestionSkeleton />
      </>
    );
  }

  if (deck.questions.length === 0) {
    return (
      <>
        <div className="w-full text-center py-12 flex flex-col items-center gap-4">
          <div className="text-4xl" aria-hidden>
            ✨
          </div>
          <SectionHead
            eyebrow="חזרה חכמה"
            title="עוד אין מספיק נתונים"
            subtitle="ענה על כמה שאלות במבחן או בלימוד נושא — ואז נחזיר לך אותן בזמן הנכון."
            align="center"
          />
          <div className="flex gap-3 mt-2">
            <Link
              href="/exam"
              className="inline-flex items-center justify-center h-11 px-5 rounded-[var(--th-radius-lg)] bg-[var(--th-accent)] text-white text-sm font-semibold hover:bg-[var(--th-accent-hover)] transition-colors"
            >
              מבחן תרגול
            </Link>
            <Link
              href="/study"
              className="inline-flex items-center justify-center h-11 px-5 rounded-[var(--th-radius-lg)] border border-[var(--th-border)] text-sm font-medium hover:bg-[var(--th-muted-bg)] transition-colors"
            >
              לימוד לפי נושא
            </Link>
          </div>
        </div>
      </>
    );
  }

  if (done) {
    const pct = Math.round((correctCount / deck.questions.length) * 100);
    return (
      <>
        <div className="w-full text-center py-12 flex flex-col items-center gap-4">
          <div className="text-4xl" aria-hidden>
            🎯
          </div>
          <SectionHead
            eyebrow={`${correctCount} מתוך ${deck.questions.length} נכון · ${pct}%`}
            title="סיימת את הסבב"
            subtitle="הנתונים עודכנו. נחזור אליך בסבב הבא עם השאלות שעדיין מאתגרות אותך."
            align="center"
          />
          <div className="flex gap-3 mt-2">
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="inline-flex items-center justify-center h-11 px-5 rounded-[var(--th-radius-lg)] bg-[var(--th-accent)] text-white text-sm font-semibold hover:bg-[var(--th-accent-hover)] transition-colors"
            >
              סבב נוסף
            </button>
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

  const { summary } = deck;
  const chips: string[] = [];
  if (summary.wrongCount > 0) chips.push(`${summary.wrongCount} שטעית בהן`);
  if (summary.newCount > 0) chips.push(`${summary.newCount} חדשות`);
  if (summary.bookmarkCount > 0) chips.push(`${summary.bookmarkCount} שמורות`);

  return (
    <>
      <SectionHead
        eyebrow="חזרה חכמה"
        title={`${deck.questions.length} שאלות שכדאי לחזור עליהן`}
        subtitle={chips.length > 0 ? chips.join(" · ") : undefined}
      />
      <div className="w-full flex items-center justify-between gap-3">
        <ProgressBar current={currentIndex + 1} total={deck.questions.length} />
        {accuracyPct !== null && (
          <span className="shrink-0 text-xs text-[var(--th-muted-strong)] font-semibold tabular-nums">
            {accuracyPct}%
          </span>
        )}
      </div>
      <QuestionCard
        question={deck.questions[currentIndex]}
        showAnswer={showAnswer}
        selectedAnswer={selectedAnswer}
        onReveal={handleReveal}
        onAnswer={handleAnswer}
        onNext={handleNext}
        onPrev={handlePrev}
        currentIndex={currentIndex}
        total={deck.questions.length}
        direction={direction}
        trackStats
      />
    </>
  );
}
