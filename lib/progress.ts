import type { Question } from "@/components/QuestionCard";
import type { QuestionStats } from "@/lib/storage";

export interface TopicAccuracy {
  topic: string;
  seen: number;
  total: number;
  correct: number;
  wrong: number;
  accuracy: number; // 0..1, over seen only
  coverage: number; // 0..1, seen / total
}

export function getTopicAccuracy(
  questions: Question[],
  stats: Record<string, QuestionStats>
): TopicAccuracy[] {
  const byTopic = new Map<string, TopicAccuracy>();
  for (const q of questions) {
    let t = byTopic.get(q.topic);
    if (!t) {
      t = {
        topic: q.topic,
        seen: 0,
        total: 0,
        correct: 0,
        wrong: 0,
        accuracy: 0,
        coverage: 0,
      };
      byTopic.set(q.topic, t);
    }
    t.total++;
    const s = stats[q.id];
    if (s && s.seen > 0) {
      t.seen++;
      t.correct += s.correct;
      t.wrong += s.wrong;
    }
  }
  for (const t of byTopic.values()) {
    const ans = t.correct + t.wrong;
    t.accuracy = ans > 0 ? t.correct / ans : 0;
    t.coverage = t.total > 0 ? t.seen / t.total : 0;
  }
  return [...byTopic.values()];
}

export interface MissedQuestion {
  question: Question;
  wrong: number;
  seen: number;
  wrongRate: number;
}

export function getMostMissed(
  questions: Question[],
  stats: Record<string, QuestionStats>,
  limit = 10
): MissedQuestion[] {
  const out: MissedQuestion[] = [];
  for (const q of questions) {
    const s = stats[q.id];
    if (!s || s.seen === 0 || s.wrong === 0) continue;
    out.push({
      question: q,
      wrong: s.wrong,
      seen: s.seen,
      wrongRate: s.wrong / s.seen,
    });
  }
  // Sort by: wrong rate desc, then wrong count desc
  out.sort((a, b) => b.wrongRate - a.wrongRate || b.wrong - a.wrong);
  return out.slice(0, limit);
}
