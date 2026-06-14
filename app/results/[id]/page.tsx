"use client";

import { useEffect, useState, useRef, useCallback, useMemo } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { getAttempt, saveAttempt, recordAnswersBatch, updateStreak, getBookmarks, toggleBookmark, type Attempt } from "@/lib/storage";
import { exportResultCard, exportAttemptToDocx } from "@/lib/export";
import ShareCard from "@/components/ShareCard";
import PageShell from "@/components/PageShell";
import Skeleton from "@/components/Skeleton";
import { LABELS } from "@/lib/constants";

const PASS_SCORE = 26;

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

export default function ResultsPage() {
  const params = useParams();
  const id = Array.isArray(params.id) ? params.id[0] : (params.id ?? "");

  const [attempt, setAttempt] = useState<Attempt | null | "loading">("loading");
  const [displayScore, setDisplayScore] = useState(0);
  const [sharing, setSharing] = useState(false);
  const [exportingDocx, setExportingDocx] = useState(false);
  const [filter, setFilter] = useState<"all" | "wrong">("wrong");
  const [bookmarkSet, setBookmarkSet] = useState<Set<string>>(new Set());
  const shareCardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setBookmarkSet(getBookmarks());
  }, []);

  const handleToggleBookmark = (qid: string) => {
    const next = toggleBookmark(qid);
    setBookmarkSet(new Set(next));
  };

  useEffect(() => {
    const a = getAttempt(id);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setAttempt(a);
    if (a && !a.answersRecorded) {
      recordAnswersBatch(a.questions, a.answers);
      updateStreak();
      saveAttempt({ ...a, answersRecorded: true });
    }
  }, [id]);

  // Animate score counter
  const animateScore = useCallback((target: number) => {
    const duration = 900;
    const start = performance.now();
    function tick(now: number) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayScore(Math.round(eased * target));
      if (progress < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }, []);

  const correct = useMemo(
    () =>
      attempt && attempt !== "loading"
        ? attempt.questions.filter((q, i) => attempt.answers[i] === q.correctIndex).length
        : 0,
    [attempt]
  );

  useEffect(() => {
    if (!attempt || attempt === "loading") return;
    animateScore(correct);
  }, [attempt, animateScore, correct]);

  if (attempt === "loading") {
    return (
      <PageShell showBack={false}>
        <div aria-busy="true" aria-live="polite" className="flex flex-col gap-6">
          <Skeleton className="h-44 rounded-[var(--th-radius)]" />
          <div className="flex flex-col gap-3">
            <Skeleton className="h-12 rounded-[var(--th-radius)]" />
            <div className="grid grid-cols-2 gap-2">
              <Skeleton className="h-10 rounded-[var(--th-radius)]" />
              <Skeleton className="h-10 rounded-[var(--th-radius)]" />
              <Skeleton className="h-10 rounded-[var(--th-radius)]" />
              <Skeleton className="h-10 rounded-[var(--th-radius)]" />
            </div>
          </div>
          <Skeleton className="h-7 w-32" />
          <div className="flex flex-col gap-3">
            {[0, 1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-24 rounded-[var(--th-radius)]" />
            ))}
          </div>
        </div>
      </PageShell>
    );
  }

  if (!attempt) {
    return (
      <PageShell>
        <div className="flex flex-col items-center justify-center gap-4 py-8">
          <p className="text-[var(--th-muted)]">תוצאות המבחן לא נמצאו.</p>
          <Link href="/exam" className="text-[var(--th-accent)] underline">
            מבחן נוסף
          </Link>
        </div>
      </PageShell>
    );
  }

  const total = attempt.questions.length;
  const isFullExam = total === 30;
  const passed = isFullExam && correct >= PASS_SCORE;
  const duration = formatDuration(attempt.timeSpentSeconds);
  const wrongCount = total - correct;

  async function handleShare() {
    if (!shareCardRef.current || sharing) return;
    setSharing(true);
    try {
      await exportResultCard(shareCardRef.current);
    } finally {
      setSharing(false);
    }
  }

  async function handleExportDocx() {
    if (!attempt || attempt === "loading" || exportingDocx) return;
    setExportingDocx(true);
    try {
      await exportAttemptToDocx(attempt);
    } finally {
      setExportingDocx(false);
    }
  }

  return (
    <PageShell>
      <div className="w-full flex flex-col gap-6">
        <span className="th-eyebrow">תוצאות · מבחן תרגול</span>
        {/* Score banner */}
        <div
          className={`rounded-[var(--th-radius-lg)] border p-6 text-center flex flex-col gap-2 ${
            isFullExam
              ? passed
                ? "bg-[var(--th-success-soft)] border-[var(--th-success)]"
                : "bg-[var(--th-error-soft)] border-[var(--th-error)]"
              : "bg-[var(--th-muted-bg)] border-[var(--th-border)]"
          }`}
        >
          <span
            className={`text-6xl font-bold tabular-nums ${
              isFullExam
                ? passed
                  ? "text-[var(--th-success)]"
                  : "text-[var(--th-error)]"
                : "text-[var(--th-fg)]"
            }`}
          >
            {displayScore}/{total}
          </span>
          {isFullExam && (
            <>
              <span
                className={`text-2xl font-bold ${
                  passed ? "text-[var(--th-success)]" : "text-[var(--th-error)]"
                }`}
              >
                {passed ? "עברת! ✓" : "לא עברת ✗"}
              </span>
              <span className="text-sm font-medium text-[var(--th-muted-strong)]">
                {Math.round((correct / total) * 100)}%
              </span>
            </>
          )}
          <span className="text-sm text-[var(--th-muted)]">
            {isFullExam ? `זמן: ${duration} · ציון מעבר: ${PASS_SCORE}/30` : `זמן: ${duration}`}
          </span>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-3">
          <Link
            href="/exam"
            className="w-full flex items-center justify-center px-5 h-14 rounded-[var(--th-radius-lg)] bg-[var(--th-accent)] text-white text-base font-semibold hover:bg-[var(--th-accent-hover)] transition-colors"
          >
            מבחן נוסף
          </Link>
          <div className="grid grid-cols-2 gap-2">
            <Link
              href="/study"
              className="inline-flex items-center justify-center h-10 px-4 rounded-[var(--th-radius-lg)] border border-[var(--th-border)] text-sm font-medium hover:bg-[var(--th-muted-bg)] transition-colors"
            >
              חזרה ללמוד
            </Link>
            {wrongCount > 0 ? (
              <Link
                href={`/exam/retake/${id}`}
                className="inline-flex items-center justify-center h-10 px-4 rounded-[var(--th-radius-lg)] border border-[var(--th-border)] text-sm font-medium hover:bg-[var(--th-muted-bg)] transition-colors"
              >
                שגיאות ({wrongCount})
              </Link>
            ) : (
              <button
                disabled
                className="h-10 px-4 rounded-[var(--th-radius-lg)] border border-[var(--th-border)] text-sm font-medium opacity-40 cursor-not-allowed"
              >
                שגיאות
              </button>
            )}
            <button
              onClick={handleShare}
              disabled={sharing || !isFullExam}
              className="flex items-center justify-center gap-2 h-10 px-4 rounded-[var(--th-radius-lg)] border border-[var(--th-border)] text-sm font-medium hover:bg-[var(--th-muted-bg)] disabled:opacity-50 transition-colors"
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" />
                <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" /><line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
              </svg>
              {sharing ? "מכין..." : "שתף"}
            </button>
            <button
              onClick={handleExportDocx}
              disabled={exportingDocx}
              className="flex items-center justify-center gap-2 h-10 px-4 rounded-[var(--th-radius-lg)] border border-[var(--th-border)] text-sm font-medium hover:bg-[var(--th-muted-bg)] disabled:opacity-50 transition-colors"
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" />
              </svg>
              {exportingDocx ? "מכין..." : "DOCX"}
            </button>
          </div>
        </div>

        {/* Per-question review */}
        <div className="flex items-baseline justify-between gap-3">
          <h2 className="th-section-h">סקירת שאלות</h2>
          {wrongCount > 0 && (
            <div className="flex items-center gap-1 bg-[var(--th-muted-bg)] rounded-full p-1">
              <button
                type="button"
                onClick={() => setFilter("wrong")}
                className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors ${
                  filter === "wrong"
                    ? "bg-[var(--th-card)] text-[var(--th-fg)] shadow-sm"
                    : "text-[var(--th-muted)] hover:text-[var(--th-fg)]"
                }`}
              >
                שגויות בלבד ({wrongCount})
              </button>
              <button
                type="button"
                onClick={() => setFilter("all")}
                className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors ${
                  filter === "all"
                    ? "bg-[var(--th-card)] text-[var(--th-fg)] shadow-sm"
                    : "text-[var(--th-muted)] hover:text-[var(--th-fg)]"
                }`}
              >
                הכל ({total})
              </button>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-3">
          {attempt.questions
            .map((q, i) => ({ q, i }))
            .filter(({ q, i }) => {
              const effective = wrongCount === 0 ? "all" : filter;
              if (effective === "all") return true;
              const userAnswer = attempt.answers[i];
              return userAnswer !== q.correctIndex; // wrong OR unanswered
            })
            .map(({ q, i }) => {
            const userAnswer = attempt.answers[i];
            const isCorrect = userAnswer === q.correctIndex;
            const unanswered = userAnswer === null;

            return (
              <div
                key={q.id}
                className={`rounded-[var(--th-radius-lg)] border p-4 flex flex-col gap-3 ${
                  unanswered
                    ? "border-[var(--th-border)]"
                    : isCorrect
                    ? "border-[var(--th-success)] bg-[var(--th-success-soft)]/60"
                    : "border-[var(--th-error)] bg-[var(--th-error-soft)]/60"
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs text-[var(--th-muted)]">שאלה {i + 1}</span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleToggleBookmark(q.id)}
                      aria-label={bookmarkSet.has(q.id) ? "הסר מהשמורות" : "שמור שאלה"}
                      aria-pressed={bookmarkSet.has(q.id)}
                      className={`inline-flex items-center justify-center w-6 h-6 rounded-full transition-colors ${
                        bookmarkSet.has(q.id)
                          ? "text-[var(--th-accent)] hover:bg-[var(--th-accent-soft)]"
                          : "text-[var(--th-muted)] hover:text-[var(--th-fg)] hover:bg-[var(--th-muted-bg)]"
                      }`}
                    >
                      <span aria-hidden className="text-sm leading-none">
                        {bookmarkSet.has(q.id) ? "★" : "☆"}
                      </span>
                    </button>
                    <span
                      className={`text-xs font-bold ${
                        unanswered
                          ? "text-[var(--th-muted)]"
                          : isCorrect
                          ? "text-[var(--th-success)]"
                          : "text-[var(--th-error)]"
                      }`}
                    >
                      {unanswered ? "לא נענתה" : isCorrect ? "✓ נכון" : "✗ לא נכון"}
                    </span>
                  </div>
                </div>

                {q.image && (
                  <div className="flex justify-center">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={q.image}
                      alt={q.text}
                      className="max-h-32 object-contain rounded-lg"
                    />
                  </div>
                )}

                <p className="text-base font-semibold leading-relaxed">{q.text}</p>

                <div className="flex flex-col gap-1.5">
                  {q.answers.map((ans, idx) => {
                    const isCorrectAnswer = idx === q.correctIndex;
                    const isUserAnswer = idx === userAnswer;
                    return (
                      <div
                        key={idx}
                        className={`text-xs px-3 py-2 rounded-[var(--th-radius-sm)] border ${
                          isCorrectAnswer
                            ? "bg-[var(--th-success-soft)] border-[var(--th-success)] text-[var(--th-success)] font-semibold"
                            : isUserAnswer && !isCorrectAnswer
                            ? "bg-[var(--th-error-soft)] border-[var(--th-error)] text-[var(--th-error)]"
                            : "border-[var(--th-border)] text-[var(--th-muted)]"
                        }`}
                      >
                        <span className="font-bold me-1">{LABELS[idx]}.</span>
                        {ans}
                        {isCorrectAnswer && " ✓"}
                        {isUserAnswer && !isCorrectAnswer && " ← תשובתך"}
                      </div>
                    );
                  })}
                </div>

                {q.explanation && (
                  <div className="text-xs text-[var(--th-muted-strong)] leading-relaxed border-t border-[var(--th-border)] pt-3 mt-1">
                    <span className="font-bold text-[var(--th-fg)]">הסבר: </span>
                    {q.explanation}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Off-screen share card for image export */}
      <div
        aria-hidden="true"
        style={{ position: "absolute", top: -9999, left: -9999, pointerEvents: "none" }}
      >
        <ShareCard ref={shareCardRef} correct={correct} passed={passed} duration={duration} />
      </div>
    </PageShell>
  );
}
