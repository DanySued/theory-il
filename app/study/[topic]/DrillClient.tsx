"use client";

import { useState, useCallback, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import QuestionCard, { type Question } from "@/components/QuestionCard";
import ProgressBar from "@/components/ProgressBar";
import { motion } from "motion/react";
import StudyGuide from "@/components/StudyGuide";
import FocusHeader, { focusIconBtn } from "@/components/FocusHeader";
import BookmarkButton from "@/components/BookmarkButton";
import { goBack } from "@/components/BackButton";
import SignsCatalog from "@/components/SignsCatalog";
import { SIGNS, type SignCategory } from "@/lib/data/signs";
import { getQStats, updateStreak, getDrillPosition, saveDrillPosition } from "@/lib/storage";
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
  const router = useRouter();
  const searchParams = useSearchParams();
  const weakInitial = searchParams?.get("weak") === "1";
  const viewParam = searchParams?.get("view");

  const [view, setView] = useState<View>(
    viewParam === "drill" || weakInitial || !guide ? "drill" : "guide"
  );
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const [showAnswer, setShowAnswer] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [jumpInput, setJumpInput] = useState("");
  const [weakOnly, setWeakOnly] = useState(weakInitial);
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

  // Restore last-viewed question for this topic on mount
  useEffect(() => {
    const saved = getDrillPosition(topic);
    if (saved > 0 && saved < questions.length) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setCurrentIndex(saved);
    }
  }, [topic, questions.length]);

  // Persist position only in normal drill mode (not when filtering by weakOnly)
  useEffect(() => {
    if (!weakOnly && view === "drill") {
      saveDrillPosition(topic, currentIndex);
    }
  }, [topic, currentIndex, weakOnly, view]);

  const activeQuestions = weakOnly
    ? questions.filter((q) => weakIds.has(q.id))
    : questions;

  const activeTotal = activeQuestions.length;

  // Warm the next question's image so "next" feels instant on slow connections.
  const nextImage = activeQuestions[currentIndex + 1]?.image;
  useEffect(() => {
    if (!nextImage) return;
    const img = new Image();
    img.src = nextImage;
  }, [nextImage]);

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
      // A study day counts once the learner actually answers, not on page open.
      updateStreak();
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
      <div className="flex flex-col items-center justify-center gap-4 py-8">
        <p className="text-[var(--th-muted)]">לא נמצאו שאלות לנושא זה.</p>
        <Link href="/study" className="text-[var(--th-accent)] underline">
          חזרה לנושאים
        </Link>
      </div>
    );
  }

  // Phones: a full-width segmented control (card pill on muted track); ≥sm keeps the accent pill.
  const tabBtn = (v: View) =>
    `relative h-11 sm:h-auto px-4 py-1.5 rounded-[10px] sm:rounded-full text-[15px] sm:text-sm font-semibold transition-colors ${
      view === v
        ? "font-bold sm:font-semibold text-[var(--th-fg)] sm:text-[var(--th-on-accent)]"
        : "text-[var(--th-muted-strong)] sm:text-[var(--th-muted)] hover:text-[var(--th-fg)]"
    }`;

  const isDrill = view === "drill";
  const current = activeQuestions[currentIndex];


  const weakToggle = (size: string) => (
    <button
      type="button"
      onClick={handleWeakToggle}
      aria-pressed={weakOnly}
      className={`${size} rounded-full text-xs font-semibold border transition-colors ${
        weakOnly
          ? "bg-[var(--th-error)] border-[var(--th-error)] text-[var(--th-on-error)]"
          : "border-[var(--th-border)] text-[var(--th-muted)] hover:border-[var(--th-error)] hover:text-[var(--th-error)]"
      }`}
    >
      {weakOnly ? "✕ שאלות קשות" : "שאלות קשות"}
    </button>
  );

  return (
    <div className="w-full flex flex-col items-center gap-3 sm:gap-6">
      {isDrill && (
        <FocusHeader
          bleed
          back={{ label: "חזרה", onClick: () => goBack(router, "/study") }}
          title={topic}
          subtitle={
            activeTotal > 0
              ? `שאלה ${currentIndex + 1} מתוך ${activeTotal}${weakOnly ? " · שאלות קשות" : ""}`
              : undefined
          }
          progress={activeTotal > 0 ? (currentIndex + 1) / activeTotal : 0}
          trailing={
            current && (
              <BookmarkButton
                questionId={current.id}
                size={22}
                className={(saved) =>
                  `${focusIconBtn} ${saved ? "text-[var(--th-accent)]" : "text-[var(--th-muted-strong)]"}`
                }
              />
            )
          }
        />
      )}

      {/* Header */}
      <div className="w-full flex items-center justify-end gap-3">
        {guide ? (
          <div
            role="tablist"
            aria-label="מצב"
            className="grid grid-cols-2 w-full sm:w-auto sm:flex items-center gap-1 bg-[var(--th-muted-bg)] rounded-[14px] sm:rounded-full p-1"
          >
            {(["guide", "drill"] as const).map((v) => (
              <button
                key={v}
                role="tab"
                aria-selected={view === v}
                className={tabBtn(v)}
                onClick={() => setView(v)}
              >
                {view === v && (
                  <motion.div
                    layoutId="tab-pill"
                    className="absolute inset-0 bg-[var(--th-card)] sm:bg-[var(--th-accent)] rounded-[10px] sm:rounded-full shadow-sm sm:shadow-none"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
                <span className="relative">{v === "guide" ? "לימוד" : "תרגול"}</span>
              </button>
            ))}
          </div>
        ) : null}

      </div>

      {/* Topic title (phones show it in the FocusHeader while drilling) */}
      <div
        className={`w-full flex-col gap-1 ${view === "guide" ? "flex text-center items-center" : "hidden sm:flex"}`}
      >
        <span className="th-eyebrow">נושא</span>
        <h1 className="th-page-title">{topic}</h1>
        <p className="text-sm text-[var(--th-muted)]">
          {total} שאלות במאגר
        </p>
      </div>


      {view === "guide" && guide && (
        <>
          {topic === "תמרורים" ? (
            <div className="w-full">
              <SignsCatalog
                signs={SIGNS}
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
          {/* Weak questions toggle (phones: in the tools row under the card) */}
          <div className="hidden sm:flex w-full max-w-2xl items-center justify-between gap-3">
            <ProgressBar current={currentIndex + 1} total={activeTotal} />
            {weakToggle("shrink-0 px-3 py-1.5")}
          </div>

          {/* No weak questions message */}
          {weakOnly && activeTotal === 0 && (
            <div className="w-full max-w-2xl rounded-[var(--th-radius-lg)] border border-[var(--th-border)] bg-[var(--th-card)] p-6 text-center text-[var(--th-muted)] text-sm">
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
                focusBar
              />

              <div className="w-full max-w-2xl flex flex-wrap items-center justify-between sm:justify-center gap-2">
                <div className="sm:hidden">{weakToggle("min-h-11 px-4")}</div>
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
                    inputMode="numeric"
                    className="w-16 h-11 sm:h-auto text-center text-base sm:text-sm rounded-[var(--th-radius-sm)] border border-[var(--th-border)] bg-[var(--th-card)] px-2 py-1 text-[var(--th-fg)] focus:outline-none focus:border-[var(--th-accent)] [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                    placeholder="מס׳"
                  />
                  <button
                    type="submit"
                    className="min-h-11 sm:min-h-0 px-3 py-1 rounded-[var(--th-radius-sm)] border border-[var(--th-border)] hover:bg-[var(--th-muted-bg)] transition-colors"
                  >
                    עבור
                  </button>
                </form>
              </div>

              <p className="text-[0.7rem] text-[var(--th-muted)] hidden sm:block" aria-hidden>
                קיצורי מקלדת: ← → לניווט · 1-4 לתשובה · רווח / R לחשיפה
              </p>
            </>
          )}
        </>
      )}
    </div>
  );
}
