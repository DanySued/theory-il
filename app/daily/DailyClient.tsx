"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import QuestionCard, { type Question } from "@/components/QuestionCard";
import ProgressBar from "@/components/ProgressBar";
import PageShell from "@/components/PageShell";
import SectionHead from "@/components/SectionHead";
import { updateStreak, getStreak } from "@/lib/storage";
import {
  pickDailyDeck,
  saveDailyChallengeRecord,
  getDailyChallengeRecord,
  DAILY_DECK_SIZE,
} from "@/lib/dailyChallenge";
import { localDateStr } from "@/lib/utils";

type Phase = "loading" | "running" | "alreadyDone" | "finished";

export default function DailyClient() {
  const [phase, setPhase] = useState<Phase>("loading");
  const [deck, setDeck] = useState<Question[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [direction, setDirection] = useState(1);
  const [showAnswer, setShowAnswer] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [correctCount, setCorrectCount] = useState(0);
  const [streakAfter, setStreakAfter] = useState<number | null>(null);
  const [savedRecord, setSavedRecord] = useState<{ correctCount: number; date: string } | null>(null);

  useEffect(() => {
    const today = localDateStr(new Date());
    const rec = getDailyChallengeRecord();
    if (rec && rec.date === today) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSavedRecord({ correctCount: rec.correctCount, date: rec.date });
      setPhase("alreadyDone");
      setStreakAfter(getStreak().current);
      return;
    }
    const deckQs = pickDailyDeck(today);
    setDeck(deckQs);
    setPhase("running");
  }, []);

  const goTo = useCallback(
    (idx: number) => {
      const clamped = Math.max(0, Math.min(deck.length - 1, idx));
      setDirection(clamped >= currentIdx ? 1 : -1);
      setCurrentIdx(clamped);
      setShowAnswer(false);
      setSelectedAnswer(null);
    },
    [deck.length, currentIdx]
  );

  const handleReveal = useCallback(() => setShowAnswer(true), []);

  const handleAnswer = useCallback(
    (idx: number) => {
      const q = deck[currentIdx];
      if (idx === q.correctIndex) setCorrectCount((c) => c + 1);
      setSelectedAnswer(idx);
      setShowAnswer(true);
    },
    [deck, currentIdx]
  );

  const handleNext = useCallback(() => {
    if (currentIdx + 1 >= deck.length) {
      // Finish: save record + bump streak.
      const today = localDateStr(new Date());
      saveDailyChallengeRecord({
        date: today,
        completedAt: Date.now(),
        correctCount,
      });
      const newStreak = updateStreak();
      setStreakAfter(newStreak.current);
      setPhase("finished");
      return;
    }
    goTo(currentIdx + 1);
  }, [currentIdx, deck.length, goTo, correctCount]);

  const handlePrev = useCallback(() => goTo(currentIdx - 1), [currentIdx, goTo]);

  if (phase === "loading") {
    return (
      <PageShell>
        <div className="w-full h-64 bg-[var(--th-muted-bg)] rounded-[var(--th-radius-lg)] animate-pulse" />
      </PageShell>
    );
  }

  if (phase === "alreadyDone" && savedRecord) {
    const pct = Math.round((savedRecord.correctCount / DAILY_DECK_SIZE) * 100);
    return (
      <PageShell>
        <div className="w-full text-center py-12 flex flex-col items-center gap-4">
          <div className="text-4xl" aria-hidden>
            ✓
          </div>
          <SectionHead
            eyebrow={`היום: ${savedRecord.correctCount}/${DAILY_DECK_SIZE} נכון · ${pct}%`}
            title="האתגר היומי הושלם"
            subtitle={
              streakAfter !== null
                ? `רצף ${streakAfter} ימים · נחזור מחר עם אתגר חדש.`
                : "נחזור מחר עם אתגר חדש."
            }
            align="center"
          />
          <div className="flex gap-3 mt-2">
            <Link
              href="/review"
              className="inline-flex items-center justify-center h-11 px-5 rounded-[var(--th-radius-lg)] bg-[var(--th-accent)] text-white text-sm font-semibold hover:bg-[var(--th-accent-hover)] transition-colors"
            >
              חזרה חכמה
            </Link>
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

  if (phase === "finished") {
    const pct = Math.round((correctCount / DAILY_DECK_SIZE) * 100);
    const allCorrect = correctCount === DAILY_DECK_SIZE;
    return (
      <PageShell>
        <div className="w-full text-center py-12 flex flex-col items-center gap-4">
          <div className="text-5xl" aria-hidden>
            {allCorrect ? "🎯" : "✨"}
          </div>
          <SectionHead
            eyebrow={`${correctCount}/${DAILY_DECK_SIZE} נכון · ${pct}%`}
            title={allCorrect ? "מושלם!" : "סיימת את האתגר היומי"}
            subtitle={
              streakAfter !== null
                ? `רצף ${streakAfter} ${streakAfter === 1 ? "יום" : "ימים"}. נחזור מחר.`
                : "נחזור מחר עם 3 שאלות חדשות."
            }
            align="center"
          />
          <div className="flex gap-3 mt-2">
            <Link
              href="/review"
              className="inline-flex items-center justify-center h-11 px-5 rounded-[var(--th-radius-lg)] bg-[var(--th-accent)] text-white text-sm font-semibold hover:bg-[var(--th-accent-hover)] transition-colors"
            >
              להמשיך בחזרה חכמה
            </Link>
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

  if (deck.length === 0) {
    return (
      <PageShell>
        <div className="w-full text-center py-12">
          <p className="text-[var(--th-muted)]">לא הצלחנו לבנות את האתגר.</p>
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <SectionHead
        eyebrow="אתגר יומי"
        title={`3 שאלות שכדאי שתבדוק היום`}
        subtitle="בחרנו 3 שאלות שעלולות להפיל אותך — מהמקומות הרגישים שלך, או חדשות שעוד לא ראית."
      />
      <ProgressBar current={currentIdx + 1} total={deck.length} />
      <QuestionCard
        question={deck[currentIdx]}
        showAnswer={showAnswer}
        selectedAnswer={selectedAnswer}
        onReveal={handleReveal}
        onAnswer={handleAnswer}
        onNext={handleNext}
        onPrev={handlePrev}
        currentIndex={currentIdx}
        total={deck.length}
        direction={direction}
        trackStats
      />
    </PageShell>
  );
}
