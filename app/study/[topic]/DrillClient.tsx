"use client";

import { useState, useCallback, useEffect } from "react";
import Link from "next/link";
import BackButton from "@/components/BackButton";
import QuestionCard, { type Question } from "@/components/QuestionCard";
import ProgressBar from "@/components/ProgressBar";
import ExportMenu from "@/components/ExportMenu";
import { motion } from "motion/react";
import StudyGuide from "@/components/StudyGuide";
import SignsCatalog from "@/components/SignsCatalog";
import { SIGNS, type SignCategory } from "@/lib/data/signs";
import { getQStats, updateStreak } from "@/lib/storage";
import type { TopicGuide } from "@/lib/data/guides";

// Maps guide section titles (for "תמרורים") to SignCategory keys
const SECTION_TO_CATEGORY: Record<string, SignCategory> = {
  "תמרורי אזהרה": "אזהרה",
  "תמרורי חובה": "חובה",
  "תמרורי איסור": "איסור",
  "תמרורי מידע": "מידע",
  "סימוני כביש": "סימוני כביש",
};

interface DrillClientProps {
  topic: string;
  questions: Question[];
  guide?: TopicGuide;
}

type View = "guide" | "drill";

export default function DrillClient({ topic, questions, guide }: DrillClientProps) {
  const [view, setView] = useState<View>(guide ? "guide" : "drill");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const [showAnswer, setShowAnswer] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [jumpInput, setJumpInput] = useState("");
  const [weakOnly, setWeakOnly] = useState(false);
  const [weakIds, setWeakIds] = useState<Set<string>>(new Set());

  const total = questions.length;

  // Load weak question IDs from localStorage
  useEffect(() => {
    const stats = getQStats();
    const weak = new Set(
      questions
        .filter((q) => {
          const s = stats[q.id];
          return s && s.seen >= 1 && s.wrong / s.seen > 0.4;
        })
        .map((q) => q.id)
    );
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setWeakIds(weak);
  }, [questions]);

  // Track study session for streak
  useEffect(() => {
    updateStreak();
  }, []);

  const activeQuestions = weakOnly
    ? questions.filter((q) => weakIds.has(q.id))
    : questions;

  const activeTotal = activeQuestions.length;

  const goTo = useCallback(
    (idx: number) => {
      const clamped = Math.max(0, Math.min(activeTotal - 1, idx));
      setDirection(clamped >= currentIndex ? 1 : -1);
      setCurrentIndex(clamped);
      setShowAnswer(false);
      setSelectedAnswer(null);
      setJumpInput("");
    },
    [activeTotal, currentIndex]
  );

  const handleReveal = useCallback(() => setShowAnswer(true), []);
  const handleAnswer = useCallback(
    (idx: number) => {
      setSelectedAnswer(idx);
      setShowAnswer(true);
    },
    []
  );
  const handleNext = useCallback(() => goTo(currentIndex + 1), [currentIndex, goTo]);
  const handlePrev = useCallback(() => goTo(currentIndex - 1), [currentIndex, goTo]);

  const handleJump = (e: React.FormEvent) => {
    e.preventDefault();
    const n = parseInt(jumpInput, 10);
    if (!isNaN(n) && n >= 1 && n <= activeTotal) goTo(n - 1);
  };

  const handleWeakToggle = () => {
    setWeakOnly((w) => !w);
    setCurrentIndex(0);
    setShowAnswer(false);
    setSelectedAnswer(null);
  };

  if (total === 0) {
    return (
      <main className="flex flex-1 flex-col items-center justify-center px-6 py-16 gap-4">
        <p className="text-[var(--th-muted)]">לא נמצאו שאלות לנושא זה.</p>
        <Link href="/study" className="text-[var(--th-accent)] underline">
          חזרה לנושאים
        </Link>
      </main>
    );
  }

  const tabBtn = (v: View) =>
    `relative px-4 py-1.5 rounded-full text-sm font-semibold transition-colors ${
      view === v ? "text-white" : "text-[var(--th-muted)] hover:text-[var(--th-fg)]"
    }`;

  return (
    <main className="flex flex-1 flex-col items-center px-4 py-8 gap-6">
      {/* Header */}
      <div className="w-full max-w-2xl flex items-center justify-between gap-3">
        <BackButton />

        {guide ? (
          <div className="flex items-center gap-1 bg-[var(--th-muted-bg)] rounded-full p-1">
            {(["guide", "drill"] as const).map((v) => (
              <button key={v} className={tabBtn(v)} onClick={() => setView(v)}>
                {view === v && (
                  <motion.div
                    layoutId="tab-pill"
                    className="absolute inset-0 bg-[var(--th-accent)] rounded-full"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
                <span className="relative">{v === "guide" ? "לימוד" : "תרגול"}</span>
              </button>
            ))}
          </div>
        ) : (
          <span className="text-sm font-semibold">{topic}</span>
        )}

        <span className="hidden"><ExportMenu topic={topic} questions={questions} /></span>
      </div>

      {guide && view === "guide" && (
        <div className="w-full max-w-2xl">
          <p className="th-eyebrow">{topic}</p>
        </div>
      )}

      {view === "guide" && guide && (
        <>
          {topic === "תמרורים" ? (
            <div className="w-full max-w-6xl">
              <SignsCatalog
                signs={SIGNS}
                guideIntro={guide.intro}
                guideSections={Object.fromEntries(
                  guide.sections
                    .filter((s) => SECTION_TO_CATEGORY[s.title])
                    .map((s) => [SECTION_TO_CATEGORY[s.title], s])
                ) as Partial<Record<SignCategory, { body: string; points?: string[] }>>}
              />
            </div>
          ) : (
            <StudyGuide guide={guide} questions={questions} />
          )}
        </>
      )}

      {view === "drill" && (
        <>
          {/* Weak questions toggle */}
          <div className="w-full max-w-2xl flex items-center justify-between gap-3">
            <ProgressBar current={currentIndex + 1} total={activeTotal} />
            <button
              onClick={handleWeakToggle}
              className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors ${
                weakOnly
                  ? "bg-[var(--th-error)] border-[var(--th-error)] text-white"
                  : "border-[var(--th-border)] text-[var(--th-muted)] hover:border-[var(--th-error)] hover:text-[var(--th-error)]"
              }`}
            >
              {weakOnly ? "✕ שאלות קשות" : "שאלות קשות"}
            </button>
          </div>

          {/* No weak questions message */}
          {weakOnly && activeTotal === 0 && (
            <div className="w-full max-w-2xl rounded-[var(--th-radius)] border border-[var(--th-border)] bg-[var(--th-card)] p-6 text-center text-[var(--th-muted)] text-sm">
              אין עדיין שאלות קשות — ענה על כמה שאלות קודם
            </div>
          )}

          {activeTotal > 0 && (
            <>
              <QuestionCard
                question={activeQuestions[currentIndex]}
                showAnswer={showAnswer}
                selectedAnswer={selectedAnswer}
                onReveal={handleReveal}
                onAnswer={handleAnswer}
                onNext={handleNext}
                onPrev={handlePrev}
                currentIndex={currentIndex}
                total={activeTotal}
                direction={direction}
                trackStats
              />

              <form
                onSubmit={handleJump}
                className="flex items-center gap-2 text-sm text-[var(--th-muted)]"
              >
                <label htmlFor="jump-input" className="whitespace-nowrap">
                  קפוץ לשאלה:
                </label>
                <input
                  id="jump-input"
                  type="number"
                  min={1}
                  max={activeTotal}
                  value={jumpInput}
                  onChange={(e) => setJumpInput(e.target.value)}
                  className="w-16 text-center rounded-lg border border-[var(--th-border)] bg-[var(--th-card)] px-2 py-1 text-[var(--th-fg)] focus:outline-none focus:border-[var(--th-accent)]"
                  placeholder="מס׳"
                />
                <button
                  type="submit"
                  className="px-3 py-1 rounded-lg border border-[var(--th-border)] hover:bg-[var(--th-muted-bg)] transition-colors"
                >
                  עבור
                </button>
              </form>
            </>
          )}
        </>
      )}
    </main>
  );
}
