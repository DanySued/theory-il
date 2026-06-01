import type { Metadata } from "next";
import questionsData from "@/lib/data/questions.json";
import TopicGrid from "@/components/TopicGrid";

export const metadata: Metadata = {
  title: "לימוד לפי נושאים — תיאוריה",
};

interface Question {
  id: string;
  topic: string;
  text: string;
  image?: string;
  answers: [string, string, string, string];
  correctIndex: 0 | 1 | 2 | 3;
  explanation?: string;
}

const questions = questionsData as Question[];

// Ordered list of topic labels so we display them in a meaningful order
const TOPIC_ORDER = ["חוקי התנועה", "תמרורים", "בטיחות", "הכרת הרכב"];

export default function StudyPage() {
  // Compute per-topic counts
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
    <main className="flex flex-1 flex-col items-center px-6 py-12 gap-8">
      <div className="w-full max-w-2xl flex flex-col gap-2">
        <h1 className="text-3xl font-bold">לימוד לפי נושאים</h1>
        <p className="text-[var(--th-muted)]">בחר נושא ללמידה</p>
      </div>
      <TopicGrid topics={topics} />
    </main>
  );
}
