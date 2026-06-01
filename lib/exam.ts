import questionsRaw from "@/lib/data/questions.json";
import type { Question } from "@/components/QuestionCard";

const ALL_QUESTIONS = questionsRaw as Question[];

// Proportional allocation across the 4 ב topics (totals 30)
const TOPIC_ALLOC: Record<string, number> = {
  "חוקי התנועה": 12,
  "תמרורים": 9,
  "בטיחות": 7,
  "הכרת הרכב": 2,
};

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function generateExam(): Question[] {
  const byTopic = new Map<string, Question[]>();
  for (const q of ALL_QUESTIONS) {
    if (!byTopic.has(q.topic)) byTopic.set(q.topic, []);
    byTopic.get(q.topic)!.push(q);
  }

  const selected: Question[] = [];
  for (const [topic, count] of Object.entries(TOPIC_ALLOC)) {
    const pool = shuffle(byTopic.get(topic) ?? []);
    selected.push(...pool.slice(0, count));
  }

  return shuffle(selected);
}
