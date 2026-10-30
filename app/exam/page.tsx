"use client";

import { useEffect, useState } from "react";
import ExamRunner from "@/components/ExamRunner";
import ExamStartScreen, { type ExamConfig } from "@/components/ExamStartScreen";
import PageShell from "@/components/PageShell";
import { generateExam, generateExamByTopic, generateWeakFocusExam } from "@/lib/exam";
import { loadCorpus } from "@/lib/data/corpus";
import { isShuffleEnabled, randomSeed, withShuffledAnswers } from "@/lib/answerOrder";
import type { Question } from "@/components/QuestionCard";

export default function ExamPage() {
  const [questions, setQuestions] = useState<Question[] | null>(null);

  // Warm the corpus while the learner reads the start screen, so "start" is instant.
  useEffect(() => {
    loadCorpus();
  }, []);

  async function handleStart(config: ExamConfig) {
    const { topic, length, weakFocus } = config;
    const all = await loadCorpus();
    let qs: Question[];
    if (weakFocus) {
      qs = generateWeakFocusExam(all, length, topic);
    } else if (topic === null) {
      qs = generateExam(all, length);
    } else {
      qs = generateExamByTopic(all, topic, length);
    }
    if (isShuffleEnabled()) {
      const seed = randomSeed();
      qs = qs.map((q) => withShuffledAnswers(q, seed));
    }
    setQuestions(qs);
  }

  if (!questions) {
    return (
      <PageShell mobileBack={false}>
        <ExamStartScreen onStart={handleStart} />
      </PageShell>
    );
  }
  return <ExamRunner questions={questions} />;
}
