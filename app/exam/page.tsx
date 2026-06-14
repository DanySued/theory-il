"use client";

import { useState } from "react";
import ExamRunner from "@/components/ExamRunner";
import ExamStartScreen, { type ExamConfig } from "@/components/ExamStartScreen";
import PageShell from "@/components/PageShell";
import { generateExam, generateExamByTopic, generateWeakFocusExam } from "@/lib/exam";
import type { Question } from "@/components/QuestionCard";

export default function ExamPage() {
  const [questions, setQuestions] = useState<Question[] | null>(null);

  function handleStart(config: ExamConfig) {
    const { topic, length, weakFocus } = config;
    let qs: Question[];
    if (weakFocus) {
      qs = generateWeakFocusExam(length, topic);
    } else if (topic === null) {
      qs = generateExam(length);
    } else {
      qs = generateExamByTopic(topic, length);
    }
    setQuestions(qs);
  }

  if (!questions) {
    return (
      <PageShell>
        <ExamStartScreen onStart={handleStart} />
      </PageShell>
    );
  }
  return <ExamRunner questions={questions} />;
}
