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
      <>
        <div className="w-full px-4 pt-3 flex justify-start">
          <BackButton />
        </div>
        <ExamStartScreen onStart={handleStart} />
      </>
    );
  }
  return <ExamRunner questions={questions} />;
}
