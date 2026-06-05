import type { Metadata } from "next";
import questionsData from "@/lib/data/questions.json";
import type { Question } from "@/components/QuestionCard";
import TopicGridClient from "@/components/TopicGridClient";
import BackButton from "@/components/BackButton";

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
    <main className="flex flex-1 flex-col items-center px-6 py-8 gap-8">
      <div className="w-full max-w-5xl flex justify-start">
        <BackButton />
      </div>
      <div className="w-full max-w-5xl flex flex-col gap-2">
        <span className="th-eyebrow">{topics.length} נושאים</span>
        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight leading-none">
          לימוד לפי נושאים
        </h1>
        <p className="text-[var(--th-muted-strong)] text-base mt-1">
          בחר נושא — שאלות מהמאגר הרשמי, עם הסבר אחרי כל תשובה.
        </p>
      </div>
      <TopicGridClient topics={topics} questions={questions} />
    </main>
  );
}
