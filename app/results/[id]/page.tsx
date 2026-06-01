"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { getAttempt, type Attempt } from "@/lib/storage";

const PASS_SCORE = 26;
const LABELS = ["א", "ב", "ג", "ד"] as const;

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

export default function ResultsPage() {
  const params = useParams();
  const id = Array.isArray(params.id) ? params.id[0] : (params.id ?? "");

  const [attempt, setAttempt] = useState<Attempt | null | "loading">("loading");

  useEffect(() => {
    setAttempt(getAttempt(id));
  }, [id]);

  if (attempt === "loading") return null;

  if (!attempt) {
    return (
      <main className="flex flex-1 flex-col items-center justify-center px-6 py-16 gap-4">
        <p className="text-[var(--th-muted)]">תוצאות המבחן לא נמצאו.</p>
        <Link href="/exam" className="text-[var(--th-accent)] underline">
          התחל מבחן חדש
        </Link>
      </main>
    );
  }

  const correct = attempt.questions.filter((q, i) => attempt.answers[i] === q.correctIndex).length;
  const passed = correct >= PASS_SCORE;

  return (
    <main className="flex flex-1 flex-col items-center px-4 py-8 gap-8">
      <div className="w-full max-w-2xl flex flex-col gap-6">
        {/* Score banner */}
        <div
          className={`rounded-[var(--th-radius)] border p-6 text-center flex flex-col gap-2 ${
            passed ? "bg-green-50 border-green-300" : "bg-red-50 border-red-300"
          }`}
        >
          <span
            className={`text-6xl font-bold ${passed ? "text-[var(--th-success)]" : "text-[var(--th-error)]"}`}
          >
            {correct}/30
          </span>
          <span
            className={`text-2xl font-bold ${passed ? "text-[var(--th-success)]" : "text-[var(--th-error)]"}`}
          >
            {passed ? "עברת! ✓" : "לא עברת ✗"}
          </span>
          <span className="text-sm text-[var(--th-muted)]">
            זמן: {formatDuration(attempt.timeSpentSeconds)} · ציון מעבר: {PASS_SCORE}/30
          </span>
        </div>

        {/* Actions */}
        <div className="flex gap-3 flex-wrap justify-center">
          <Link
            href="/exam"
            className="px-5 py-2.5 rounded-[var(--th-radius)] bg-[var(--th-accent)] text-white text-sm font-semibold hover:bg-[var(--th-accent-hover)] transition-colors"
          >
            מבחן נוסף
          </Link>
          <Link
            href="/study"
            className="px-5 py-2.5 rounded-[var(--th-radius)] border border-[var(--th-border)] text-sm font-medium hover:bg-[var(--th-muted-bg)] transition-colors"
          >
            חזרה ללמוד
          </Link>
        </div>

        {/* Per-question review */}
        <h2 className="text-xl font-bold">סקירת שאלות</h2>

        <div className="flex flex-col gap-4">
          {attempt.questions.map((q, i) => {
            const userAnswer = attempt.answers[i];
            const isCorrect = userAnswer === q.correctIndex;
            const unanswered = userAnswer === null;

            return (
              <div
                key={q.id}
                className={`rounded-[var(--th-radius)] border p-4 flex flex-col gap-3 ${
                  unanswered
                    ? "border-[var(--th-border)]"
                    : isCorrect
                    ? "border-green-300 bg-green-50/40"
                    : "border-red-300 bg-red-50/40"
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs text-[var(--th-muted)]">שאלה {i + 1}</span>
                  <span
                    className={`text-sm font-bold ${
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

                <p className="text-sm font-semibold leading-relaxed">{q.text}</p>

                <div className="flex flex-col gap-1.5">
                  {q.answers.map((ans, idx) => {
                    const isCorrectAnswer = idx === q.correctIndex;
                    const isUserAnswer = idx === userAnswer;
                    return (
                      <div
                        key={idx}
                        className={`text-xs px-3 py-2 rounded-lg border ${
                          isCorrectAnswer
                            ? "bg-green-100 border-green-400 text-green-800 font-semibold"
                            : isUserAnswer && !isCorrectAnswer
                            ? "bg-red-100 border-red-400 text-red-800"
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
              </div>
            );
          })}
        </div>
      </div>
    </main>
  );
}
