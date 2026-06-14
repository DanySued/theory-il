import questionsRaw from "@/lib/data/questions.json";
import type { Question } from "@/components/QuestionCard";
import { getQStats, getBookmarks } from "@/lib/storage";
import { rankQuestions } from "@/lib/review";

const ALL_QUESTIONS = questionsRaw as Question[];

// Proportional allocation across the 4 ב topics (totals 30, scaled when length ≠ 30)
const TOPIC_ALLOC: Record<string, number> = {
  "חוקי התנועה": 12,
  "תמרורים": 9,
  "בטיחות": 7,
  "הכרת הרכב": 2,
};

export function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function generateExamByTopic(topic: string, length = 30): Question[] {
  const pool = ALL_QUESTIONS.filter((q) => q.topic === topic);
  return shuffle(pool).slice(0, length);
}

export function generateExam(length = 30): Question[] {
  const byTopic = new Map<string, Question[]>();
  for (const q of ALL_QUESTIONS) {
    if (!byTopic.has(q.topic)) byTopic.set(q.topic, []);
    byTopic.get(q.topic)!.push(q);
  }

  // Scale topic allocation proportionally when length differs from 30
  const ratio = length / 30;
  const selected: Question[] = [];
  for (const [topic, count] of Object.entries(TOPIC_ALLOC)) {
    const pool = shuffle(byTopic.get(topic) ?? []);
    selected.push(...pool.slice(0, Math.round(count * ratio)));
  }

  // Trim/pad to exact length (rounding may produce ±1)
  if (selected.length > length) selected.length = length;
  if (selected.length < length) {
    const ids = new Set(selected.map((q) => q.id));
    for (const q of shuffle(ALL_QUESTIONS)) {
      if (selected.length >= length) break;
      if (!ids.has(q.id)) selected.push(q);
    }
  }

  return shuffle(selected);
}

/**
 * Builds an exam focused on the user's weak spots — leans on the same ranker
 * that powers /review, but caps length to match exam mode.
 */
export function generateWeakFocusExam(length = 30, topic?: string | null): Question[] {
  const pool = topic ? ALL_QUESTIONS.filter((q) => q.topic === topic) : ALL_QUESTIONS;
  const stats = getQStats();
  const bookmarks = getBookmarks();
  const ranked = rankQuestions({ questions: pool, stats, bookmarks }, length);
  // Shuffle the result so the hardest question isn't always first.
  return shuffle(ranked);
}
