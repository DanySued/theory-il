import type { Question } from "@/components/QuestionCard";
import type { QuestionStats } from "@/lib/storage";

const DAY = 24 * 60 * 60 * 1000;

interface RankInputs {
  questions: Question[];
  stats: Record<string, QuestionStats>;
  bookmarks: Set<string>;
  now?: number;
}

interface ScoredQuestion {
  question: Question;
  score: number;
  seen: boolean;
  wrongCount: number;
}

/**
 * Score every question by how much it needs review.
 * Higher = more important to surface.
 *
 *   - wrong rate dominates: more misses → higher score
 *   - never-seen baseline so the deck includes new material
 *   - recency boost: questions not seen recently float up
 *   - bookmark bonus: explicit user signal
 */
function score(q: Question, s: QuestionStats | undefined, bookmarked: boolean, now: number): ScoredQuestion {
  if (!s || s.seen === 0) {
    return {
      question: q,
      seen: false,
      wrongCount: 0,
      score: 0.5 + (bookmarked ? 0.2 : 0),
    };
  }
  const wrongRate = s.wrong / s.seen;
  const daysSince = Math.max(0, (now - s.lastSeen) / DAY);
  // Recency: starts at 1.0 immediately after seeing, climbs to ~2 after a week
  const recencyMultiplier = 1 + Math.min(daysSince / 7, 1);
  const baseScore = wrongRate * recencyMultiplier;
  return {
    question: q,
    seen: true,
    wrongCount: s.wrong,
    score: baseScore + (bookmarked ? 0.3 : 0),
  };
}

/**
 * Return the top N questions ordered by review priority, with light topic mixing
 * so a single weak topic doesn't dominate the deck.
 */
export function rankQuestions(
  { questions, stats, bookmarks, now = Date.now() }: RankInputs,
  limit = 20
): Question[] {
  const scored = questions
    .map((q) => score(q, stats[q.id], bookmarks.has(q.id), now))
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score);

  // Soft cap per topic to avoid one weak area dominating
  const perTopicCap = Math.max(3, Math.ceil(limit / 3));
  const byTopic = new Map<string, number>();
  const picked: Question[] = [];

  for (const s of scored) {
    if (picked.length >= limit) break;
    const used = byTopic.get(s.question.topic) ?? 0;
    if (used >= perTopicCap) continue;
    picked.push(s.question);
    byTopic.set(s.question.topic, used + 1);
  }

  // If cap-skipping left us short, fill from the remaining scored list
  if (picked.length < limit) {
    const seen = new Set(picked.map((q) => q.id));
    for (const s of scored) {
      if (picked.length >= limit) break;
      if (!seen.has(s.question.id)) picked.push(s.question);
    }
  }

  return picked;
}

export function reviewDeckSummary(
  questions: Question[],
  stats: Record<string, QuestionStats>,
  bookmarks: Set<string>
): { total: number; wrongCount: number; newCount: number; bookmarkCount: number } {
  let wrongCount = 0;
  let newCount = 0;
  let bookmarkCount = 0;
  for (const q of questions) {
    const s = stats[q.id];
    if (!s || s.seen === 0) newCount++;
    else if (s.wrong > 0) wrongCount++;
    if (bookmarks.has(q.id)) bookmarkCount++;
  }
  return { total: questions.length, wrongCount, newCount, bookmarkCount };
}
