"use client";

import { useState } from "react";
import ExamRunner from "@/components/ExamRunner";
import ExamStartScreen from "@/components/ExamStartScreen";
import BackButton from "@/components/BackButton";
import { generateExam, generateExamByTopic } from "@/lib/exam";
import type { Question } from "@/components/QuestionCard";

export default function ExamPage() {
  const [questions, setQuestions] = useState<Question[] | null>(null);

  function handleStart(topic: string | null) {
    setQuestions(topic === null ? generateExam() : generateExamByTopic(topic));
  }

  if (!questions) {
    return (
      <main className="flex flex-1 flex-col items-center px-4 py-8 gap-8">
        <div className="w-full max-w-lg">
          <BackButton />
        </div>
        <div className="w-full max-w-lg">
          <ExamStartScreen onStart={handleStart} />
        </div>
      </main>
    );
  }
  return <ExamRunner questions={questions} />;
}
