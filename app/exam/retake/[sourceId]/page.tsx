"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import ExamRunner from "@/components/ExamRunner";
import BackButton from "@/components/BackButton";
import { getAttempt } from "@/lib/storage";
import { shuffle } from "@/lib/exam";
import type { Question } from "@/components/QuestionCard";

type State =
  | { kind: "loading" }
  | { kind: "missing" }
  | { kind: "ready"; questions: Question[] };

export default function RetakePage() {
  const params = useParams();
  const sourceId = Array.isArray(params.sourceId) ? params.sourceId[0] : (params.sourceId ?? "");
  const [state, setState] = useState<State>({ kind: "loading" });

  useEffect(() => {
    const a = getAttempt(sourceId);
    if (!a) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setState({ kind: "missing" });
      return;
    }
    const wrong = a.questions.filter((q, i) => a.answers[i] !== q.correctIndex);
    setState({ kind: "ready", questions: shuffle(wrong) });
  }, [sourceId]);

  if (state.kind === "loading") {
    return (
      <main className="flex flex-1 items-center justify-center">
        <p className="text-[var(--th-muted)]">טוען...</p>
      </main>
    );
  }
  if (state.kind === "missing") {
    return (
      <main className="flex flex-1 flex-col items-center justify-center gap-4 px-6 py-16">
        <p className="text-[var(--th-muted)]">לא נמצא</p>
        <Link href="/exam" className="text-[var(--th-accent)] underline">מבחן נוסף</Link>
      </main>
    );
  }
  if (state.questions.length === 0) {
    return (
      <main className="flex flex-1 flex-col items-center justify-center gap-4 px-6 py-16">
        <p className="text-[var(--th-muted)]">אין שאלות לחזור עליהן — כל התשובות היו נכונות!</p>
        <Link href="/exam" className="text-[var(--th-accent)] underline">מבחן נוסף</Link>
      </main>
    );
  }
  return (
    <>
      <div className="w-full px-4 pt-3 flex justify-start">
        <BackButton />
      </div>
      <ExamRunner questions={state.questions} noTimer />
    </>
  );
}
