"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import questionsData from "@/lib/data/questions.json";
import QuestionCard, { type Question } from "@/components/QuestionCard";
import ProgressBar from "@/components/ProgressBar";
import PageShell from "@/components/PageShell";
import SectionHead from "@/components/SectionHead";
import { getQStats, updateStreak, type QuestionStats } from "@/lib/storage";

const allQuestions = questionsData as Question[];

interface MistakeRow {
  question: Question;
  stats: QuestionStats;
  wrongRate: number;
}

function buildDeck(stats: Record<string, QuestionStats>): MistakeRow[] {
  const rows: MistakeRow[] = [];
  for (const q of allQuestions) {
    const s = stats[q.id];
    if (!s || s.wrong <= 0) continue;
    const wrongRate = s.seen > 0 ? s.wrong / s.seen : 0;
    rows.push({ question: q, stats: s, wrongRate });
  }
  // Hardest first: highest wrong-rate, then most wrongs, then most recently missed.
  rows.sort((a, b) => {
    if (b.wrongRate !== a.wrongRate) return b.wrongRate - a.wrongRate;
    if (b.stats.wrong !== a.stats.wrong) return b.stats.wrong - a.stats.wrong;
    return b.stats.lastSeen - a.stats.lastSeen;
  });
  return rows;
}

export default function MistakesClient() {
  const [deck, setDeck] = useState<MistakeRow[] | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const [showAnswer, setShowAnswer] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [done, setDone] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);

  useEffect(() => {
    const stats = getQStats();
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setDeck(buildDeck(stats));
    updateStreak();
  }, []);

  const goTo = useCallback(
    (idx: number) => {
      if (!deck) return;
      const clamped = Math.max(0, Math.min(deck.length - 1, idx));
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
      const q = deck[currentIndex].question;
      if (idx === q.correctIndex) setCorrectCount((c) => c + 1);
      setSelectedAnswer(idx);
      setShowAnswer(true);
    },
    [deck, currentIndex]
  );

  const handleNext = useCallback(() => {
    if (!deck) return;
    if (currentIndex + 1 >= deck.length) {
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
      <PageShell>
        <div className="w-full h-64 bg-[var(--th-muted-bg)] rounded-[var(--th-radius-lg)] animate-pulse" />
      </PageShell>
    );
  }

  if (deck.length === 0) {
    return (
      <PageShell>
        <div className="w-full text-center py-12 flex flex-col items-center gap-4">
          <div className="text-4xl" aria-hidden>
            🧹
          </div>
          <SectionHead
            eyebrow="הטעויות שלי"
            title="אין כאן טעויות לחזור עליהן"
            subtitle="לא נרשמו תשובות שגויות עדיין. תרגל מבחן או למד נושא — וכל שאלה שתטעה בה תופיע כאן."
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
              href="/review"
              className="inline-flex items-center justify-center h-11 px-5 rounded-[var(--th-radius-lg)] border border-[var(--th-border)] text-sm font-medium hover:bg-[var(--th-muted-bg)] transition-colors"
            >
              חזרה חכמה
            </Link>
          </div>
        </div>
      </PageShell>
    );
  }

  if (done) {
    const pct = Math.round((correctCount / deck.length) * 100);
    return (
      <PageShell>
        <div className="w-full text-center py-12 flex flex-col items-center gap-4">
          <div className="text-4xl" aria-hidden>
            🎯
          </div>
          <SectionHead
            eyebrow={`${correctCount} מתוך ${deck.length} נכון · ${pct}%`}
            title="סיימת את סבב הטעויות"
            subtitle="שאלות שתענה עליהן נכון יישארו ברשימה עד שתבסס אותן. סבב נוסף יסדר אותן מחדש לפי הקושי."
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
      </PageShell>
    );
  }

  const current = deck[currentIndex];
  const wrongPct = Math.round(current.wrongRate * 100);

  return (
    <PageShell>
      <SectionHead
        eyebrow="הטעויות שלי"
        title={`${deck.length} שאלות שטעית בהן`}
        subtitle="מסודרות מהקשה ביותר — אחוז הטעייה הגבוה בראש."
      />
      <div className="w-full flex items-center justify-between gap-3">
        <ProgressBar current={currentIndex + 1} total={deck.length} />
        {accuracyPct !== null && (
          <span className="shrink-0 text-xs text-[var(--th-muted-strong)] font-semibold tabular-nums">
            {accuracyPct}%
          </span>
        )}
      </div>
      <div className="w-full flex items-center gap-2 text-xs text-[var(--th-muted-strong)]">
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[var(--th-muted-bg)] border border-[var(--th-border)] tabular-nums">
          טעית {current.stats.wrong}× מתוך {current.stats.seen}
        </span>
        <span className="tabular-nums">{wrongPct}% טעייה</span>
      </div>
      <QuestionCard
        question={current.question}
        showAnswer={showAnswer}
        selectedAnswer={selectedAnswer}
        onReveal={handleReveal}
        onAnswer={handleAnswer}
        onNext={handleNext}
        onPrev={handlePrev}
        currentIndex={currentIndex}
        total={deck.length}
        direction={direction}
        trackStats
      />
    </PageShell>
  );
}
