"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import QuestionCard, { type Question } from "@/components/QuestionCard";
import PageShell from "@/components/PageShell";
import SectionHead from "@/components/SectionHead";
import { getQStats, listAttempts, type QuestionStats } from "@/lib/storage";

interface Props {
  question: Question;
}

interface PersonalStats {
  qs: QuestionStats | null;
  appearedInExams: number;
}

function relativeHebrewTime(timestamp: number): string {
  const diffMs = Date.now() - timestamp;
  const days = Math.floor(diffMs / (24 * 60 * 60 * 1000));
  if (days < 1) return "היום";
  if (days === 1) return "אתמול";
  if (days < 7) return `לפני ${days} ימים`;
  if (days < 30) {
    const weeks = Math.floor(days / 7);
    return weeks === 1 ? "לפני שבוע" : `לפני ${weeks} שבועות`;
  }
  const months = Math.floor(days / 30);
  return months === 1 ? "לפני חודש" : `לפני ${months} חודשים`;
}

export default function QuestionDetailClient({ question }: Props) {
  const [showAnswer, setShowAnswer] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [personal, setPersonal] = useState<PersonalStats | null>(null);

  useEffect(() => {
    const stats = getQStats();
    const qs = stats[question.id] ?? null;
    const appearedInExams = listAttempts().filter((a) =>
      a.questions.some((q) => q.id === question.id)
    ).length;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPersonal({ qs, appearedInExams });
  }, [question.id]);

  const handleReveal = useCallback(() => setShowAnswer(true), []);
  const handleAnswer = useCallback((idx: number) => {
    setSelectedAnswer(idx);
    setShowAnswer(true);
  }, []);
  const noop = useCallback(() => {}, []);

  return (
    <PageShell>
      <SectionHead
        eyebrow={question.topic}
        title="שאלה בודדת"
        subtitle="קישור ישיר לשאלה הזו. אפשר לסמן בכוכב, לחשוף את התשובה, או לעבור ללימוד הנושא כולו."
      />

      <QuestionCard
        question={question}
        showAnswer={showAnswer}
        selectedAnswer={selectedAnswer}
        onReveal={handleReveal}
        onAnswer={handleAnswer}
        onNext={noop}
        onPrev={noop}
        currentIndex={0}
        total={1}
      />

      <PersonalStatsPanel personal={personal} />

      <div className="flex flex-wrap gap-3">
        <Link
          href={`/study/${encodeURIComponent(question.topic)}`}
          className="inline-flex items-center justify-center h-11 px-5 rounded-[var(--th-radius-lg)] border border-[var(--th-border)] text-sm font-medium hover:bg-[var(--th-muted-bg)] transition-colors"
        >
          ללימוד הנושא: {question.topic}
        </Link>
        <Link
          href="/review?tab=saved"
          className="inline-flex items-center justify-center h-11 px-5 rounded-[var(--th-radius-lg)] border border-[var(--th-border)] text-sm font-medium hover:bg-[var(--th-muted-bg)] transition-colors"
        >
          השמורות שלי
        </Link>
      </div>
    </PageShell>
  );
}

function PersonalStatsPanel({ personal }: { personal: PersonalStats | null }) {
  if (personal === null) {
    return <div className="h-24 rounded-[var(--th-radius-lg)] bg-[var(--th-muted-bg)] animate-pulse" />;
  }

  const { qs, appearedInExams } = personal;

  // Never seen
  if (!qs || qs.seen === 0) {
    return (
      <div className="p-4 rounded-[var(--th-radius-lg)] border border-dashed border-[var(--th-border-strong)] bg-[var(--th-card)] text-center">
        <span className="text-sm text-[var(--th-muted-strong)]">
          טרם תורגלה — נחמד שגילית אותה.
        </span>
      </div>
    );
  }

  const accuracy = qs.correct + qs.wrong > 0 ? qs.correct / (qs.correct + qs.wrong) : 0;
  const accuracyPct = Math.round(accuracy * 100);

  // Choose a verdict tone and headline
  let headline: string;
  let tone: "success" | "warn" | "neutral";
  if (qs.wrong === 0 && qs.seen >= 1) {
    headline = qs.seen === 1 ? "ענית נכון בפעם הראשונה" : `${qs.seen} פעמים נכון ברצף`;
    tone = "success";
  } else if (qs.wrong > 0 && accuracy < 0.5) {
    headline = `טעית כאן ${qs.wrong} ${qs.wrong === 1 ? "פעם" : "פעמים"} — הזמן לחזק`;
    tone = "warn";
  } else if (qs.wrong > 0) {
    headline = `${qs.correct} נכון · ${qs.wrong} שגוי`;
    tone = "neutral";
  } else {
    headline = `נצפתה ${qs.seen} ${qs.seen === 1 ? "פעם" : "פעמים"}`;
    tone = "neutral";
  }

  const toneClass = {
    success: "border-[var(--th-success)] bg-[var(--th-success-soft)]/60",
    warn: "border-[var(--th-error)] bg-[var(--th-error-soft)]/60",
    neutral: "border-[var(--th-border)] bg-[var(--th-card)]",
  }[tone];

  const accentClass = {
    success: "text-[var(--th-success)]",
    warn: "text-[var(--th-error)]",
    neutral: "text-[var(--th-fg)]",
  }[tone];

  return (
    <div className={`p-4 rounded-[var(--th-radius-lg)] border ${toneClass} flex flex-col gap-3`}>
      <div className="flex items-baseline justify-between gap-3">
        <span className={`text-sm font-bold ${accentClass}`}>{headline}</span>
        <span className="text-xs text-[var(--th-muted)] tabular-nums">
          דיוק {accuracyPct}%
        </span>
      </div>
      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-[var(--th-muted-strong)]">
        <span>
          <span className="text-[var(--th-muted)]">נצפתה: </span>
          {qs.seen} {qs.seen === 1 ? "פעם" : "פעמים"}
        </span>
        <span>
          <span className="text-[var(--th-muted)]">פעם אחרונה: </span>
          {relativeHebrewTime(qs.lastSeen)}
        </span>
        {appearedInExams > 0 && (
          <span>
            <span className="text-[var(--th-muted)]">במבחנים: </span>
            {appearedInExams}
          </span>
        )}
      </div>
    </div>
  );
}
