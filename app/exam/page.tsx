"use client";

import { useState } from "react";
import ExamRunner from "@/components/ExamRunner";
import ExamStartScreen from "@/components/ExamStartScreen";
import PageShell from "@/components/PageShell";
import { generateExam, generateExamByTopic } from "@/lib/exam";
import type { Question } from "@/components/QuestionCard";

export default function ExamPage() {
  const [questions, setQuestions] = useState<Question[] | null>(null);

  function handleStart(topic: string | null) {
    setQuestions(topic === null ? generateExam() : generateExamByTopic(topic));
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
