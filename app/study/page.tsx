import type { Metadata } from "next";
import questionsData from "@/lib/data/questions.json";
import type { Question } from "@/components/QuestionCard";
import TopicGridClient from "@/components/TopicGridClient";
import PageShell from "@/components/PageShell";
import SectionHead from "@/components/SectionHead";

export const metadata: Metadata = {
  title: "לימוד לפי נושאים — תיאוריה",
};

const questions = questionsData as Question[];

const TOPIC_ORDER = ["חוקי התנועה", "תמרורים", "בטיחות", "הכרת הרכב"];

export default function StudyPage() {
  const counts: Record<string, number> = {};
  for (const q of questions) {
    counts[q.topic] = (counts[q.topic] ?? 0) + 1;
  }

  const topics = TOPIC_ORDER.filter((t) => counts[t] !== undefined).map((t) => ({
    key: t,
    label: t,
    count: counts[t],
  }));

  return (
    <PageShell>
      <SectionHead
        eyebrow="לימוד לפי נושאים"
        title="בחר נושא להתחיל ללמוד"
        subtitle="כל השאלות מהמאגר הרשמי של משרד התחבורה, עם הסבר אחרי כל תשובה."
      />
      <TopicGridClient topics={topics} questions={questions} />
    </PageShell>
  );
}
