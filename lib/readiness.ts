import type { QuestionStats } from "@/lib/storage";
import { EXAM_LENGTH, EXAM_TOPIC_ALLOC, PASS_SCORE } from "@/lib/constants";

/**
 * Exam-readiness estimate.
 *
 * For each topic we estimate the chance of answering a random exam question correctly:
 *   p_topic = coverage · accuracy_on_seen + (1 − coverage) · UNSEEN_BASELINE
 * Accuracy is Laplace-smoothed so a handful of answers can't claim 100%. Topics are
 * weighted by how many questions they get in the real exam (12/9/7/2), giving an
 * expected score out of 30 and — treating questions as independent — the chance of
 * reaching the pass mark (binomial tail).
 */

/** Pass chance as text. Bidi-safe: a literal "<1%" renders as "1%>" inside RTL text. */
export function formatChance(p: number): string {
  return p < 0.01 ? "פחות מ-1%" : `${Math.round(p * 100)}%`;
}

/** Rough chance of getting a never-seen question right (common sense beats a 25% guess). */
export const UNSEEN_BASELINE = 0.5;
/** Below this many answered questions the estimate is too noisy to show. */
export const READINESS_MIN_SEEN = 30;

export interface TopicReadiness {
  topic: string;
  seen: number;
  total: number;
  accuracy: number; // smoothed, over seen questions
  coverage: number; // seen / total
  p: number; // estimated chance of a correct answer on an exam question from this topic
}

export interface Readiness {
  seen: number;
  total: number;
  enoughData: boolean;
  expectedScore: number; // out of EXAM_LENGTH
  passChance: number; // 0..1
  topics: TopicReadiness[];
  weakestTopic: string | null;
}

export function estimateReadiness(
  stats: Record<string, QuestionStats>,
  topicOf: (id: string) => string | undefined,
  topicTotals: Record<string, number>
): Readiness {
  const agg: Record<string, { seen: number; correct: number; answers: number }> = {};
  for (const t of Object.keys(topicTotals)) agg[t] = { seen: 0, correct: 0, answers: 0 };
  for (const s of Object.values(stats)) {
    if (!s || s.seen === 0) continue;
    const t = topicOf(s.id);
    if (!t || !agg[t]) continue;
    agg[t].seen++;
    agg[t].correct += s.correct;
    agg[t].answers += s.correct + s.wrong;
  }

  const topics: TopicReadiness[] = Object.entries(topicTotals).map(([topic, total]) => {
    const a = agg[topic];
    const accuracy = (a.correct + 1) / (a.answers + 2);
    const coverage = total > 0 ? Math.min(1, a.seen / total) : 0;
    const p = coverage * accuracy + (1 - coverage) * UNSEEN_BASELINE;
    return { topic, seen: a.seen, total, accuracy, coverage, p };
  });

  const weightSum = Object.values(EXAM_TOPIC_ALLOC).reduce((x, y) => x + y, 0);
  const pMean =
    topics.reduce((sum, t) => sum + t.p * (EXAM_TOPIC_ALLOC[t.topic] ?? 0), 0) / weightSum;

  const seen = topics.reduce((s, t) => s + t.seen, 0);
  const total = topics.reduce((s, t) => s + t.total, 0);
  const practiced = topics.filter((t) => t.seen > 0);
  const weakest = (practiced.length ? practiced : topics)
    .filter((t) => (EXAM_TOPIC_ALLOC[t.topic] ?? 0) > 0)
    .sort((a, b) => a.p - b.p)[0];

  return {
    seen,
    total,
    enoughData: seen >= READINESS_MIN_SEEN,
    expectedScore: pMean * EXAM_LENGTH,
    passChance: binomialTail(EXAM_LENGTH, pMean, PASS_SCORE),
    topics,
    weakestTopic: weakest?.topic ?? null,
  };
}

/** P(X ≥ k) for X ~ Binomial(n, p). */
export function binomialTail(n: number, p: number, k: number): number {
  if (p <= 0) return k <= 0 ? 1 : 0;
  if (p >= 1) return k <= n ? 1 : 0;
  let sum = 0;
  let coef = 1; // C(n, i), built incrementally
  for (let i = 0; i <= n; i++) {
    if (i > 0) coef = (coef * (n - i + 1)) / i;
    if (i >= k) sum += coef * p ** i * (1 - p) ** (n - i);
  }
  return Math.min(1, Math.max(0, sum));
}

export interface ExamTrend {
  thisWeek: number | null; // mean score of full exams in the last 7 days
  lastWeek: number | null; // mean score of full exams 7–14 days ago
  delta: number | null;
}

/** Week-over-week change in full-exam scores. */
export function examTrend(
  attempts: { startedAt: number; score: number; length: number }[],
  now = Date.now()
): ExamTrend {
  const DAY = 86_400_000;
  const full = attempts.filter((a) => a.length === EXAM_LENGTH);
  const mean = (xs: number[]) => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : null);
  const thisWeek = mean(full.filter((a) => now - a.startedAt < 7 * DAY).map((a) => a.score));
  const lastWeek = mean(
    full.filter((a) => now - a.startedAt >= 7 * DAY && now - a.startedAt < 14 * DAY).map((a) => a.score)
  );
  return {
    thisWeek,
    lastWeek,
    delta: thisWeek !== null && lastWeek !== null ? thisWeek - lastWeek : null,
  };
}
