import questionsData from "@/lib/data/questions.json";
import type { Question } from "@/components/QuestionCard";
import { getQStats, type QuestionStats } from "@/lib/storage";
import { localDateStr } from "@/lib/utils";

const allQuestions = questionsData as Question[];

const DAILY_KEY = "theory-il:dailyChallenge";
export const DAILY_DECK_SIZE = 3;

export interface DailyChallengeRecord {
  date: string; // "YYYY-MM-DD"
  completedAt: number;
  correctCount: number;
}

export function getDailyChallengeRecord(): DailyChallengeRecord | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(DAILY_KEY);
    return raw ? (JSON.parse(raw) as DailyChallengeRecord) : null;
  } catch {
    return null;
  }
}

export function saveDailyChallengeRecord(rec: DailyChallengeRecord): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(DAILY_KEY, JSON.stringify(rec));
}

export function isDailyCompletedToday(): boolean {
  const rec = getDailyChallengeRecord();
  return rec !== null && rec.date === localDateStr(new Date());
}

/**
 * Hash a question id together with the date so the picker is deterministic per day
 * (refreshing the daily page never reshuffles the deck) but rotates day-to-day.
 */
function dateHash(seed: string): number {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

interface ScoredQ {
  q: Question;
  tier: 0 | 1 | 2; // 0 = wrong-history, 1 = unseen, 2 = correct-history
  hash: number;
}

function classify(q: Question, s: QuestionStats | undefined): 0 | 1 | 2 {
  if (s && s.wrong > 0) return 0; // user has gotten this wrong → hardest
  if (!s || s.seen === 0) return 1; // novel
  return 2; // already mastered (used only as last-resort fill)
}

/**
 * Deterministic per-day picker. Same date + same stats → same 3 questions.
 * Stats change throughout the day (a freshly-wrong question becomes tier 0),
 * but once the user completes the challenge we lock the record by date so the
 * deck shown on "view today's result" stays stable via the saved record.
 */
export function pickDailyDeck(date = localDateStr(new Date())): Question[] {
  const stats = getQStats();

  const scored: ScoredQ[] = allQuestions.map((q) => ({
    q,
    tier: classify(q, stats[q.id]),
    hash: dateHash(`${date}:${q.id}`),
  }));

  // Sort by tier asc, then hash asc — gives stable ordering per (date, stats).
  scored.sort((a, b) => a.tier - b.tier || a.hash - b.hash);

  return scored.slice(0, DAILY_DECK_SIZE).map((s) => s.q);
}
