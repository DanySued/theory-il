import questionsData from "@/lib/data/questions.json";
import type { Question } from "@/components/QuestionCard";
import { getQStats, type QuestionStats } from "@/lib/storage";
import { localDateStr } from "@/lib/utils";
import {
  DAILY_KEY,
  getDailyChallengeRecord,
  isDailyCompletedToday,
  type DailyChallengeRecord,
} from "@/lib/dailyChallengeStatus";

export {
  getDailyChallengeRecord,
  isDailyCompletedToday,
  type DailyChallengeRecord,
};

const allQuestions = questionsData as Question[];

const DAILY_HISTORY_KEY = "theory-il:dailyHistory";
const HISTORY_CAP = 180;
export const DAILY_DECK_SIZE = 3;

export interface DailyHistoryEntry {
  date: string;
  correctCount: number;
}

export interface DailyStreak {
  current: number;
  best: number;
  totalDays: number;
}

export function getDailyHistory(): DailyHistoryEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(DAILY_HISTORY_KEY);
    const parsed = raw ? (JSON.parse(raw) as DailyHistoryEntry[]) : [];
    // Backfill from the single-record key on first read (legacy upgrade path).
    if (parsed.length === 0) {
      const rec = getDailyChallengeRecord();
      if (rec) return [{ date: rec.date, correctCount: rec.correctCount }];
    }
    return parsed;
  } catch {
    return [];
  }
}

export function saveDailyChallengeRecord(rec: DailyChallengeRecord): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(DAILY_KEY, JSON.stringify(rec));
  // Mirror into history (replace same-day entry if any), then cap and persist.
  try {
    const raw = localStorage.getItem(DAILY_HISTORY_KEY);
    const existing = raw ? (JSON.parse(raw) as DailyHistoryEntry[]) : [];
    const filtered = existing.filter((h) => h.date !== rec.date);
    filtered.push({ date: rec.date, correctCount: rec.correctCount });
    filtered.sort((a, b) => a.date.localeCompare(b.date));
    const trimmed = filtered.slice(-HISTORY_CAP);
    localStorage.setItem(DAILY_HISTORY_KEY, JSON.stringify(trimmed));
  } catch {
    // ignore quota errors
  }
}

function shiftDate(date: string, days: number): string {
  const d = new Date(`${date}T00:00:00`);
  d.setDate(d.getDate() + days);
  return localDateStr(d);
}

/**
 * Counts consecutive daily completions ending at today (or yesterday — so the user
 * doesn't lose the streak until they actually skip a day). "best" scans all of history.
 */
export function getDailyStreak(history?: DailyHistoryEntry[]): DailyStreak {
  const h = history ?? getDailyHistory();
  if (h.length === 0) return { current: 0, best: 0, totalDays: 0 };

  const dates = new Set(h.map((e) => e.date));
  const totalDays = dates.size;

  const today = localDateStr(new Date());
  const yesterday = shiftDate(today, -1);

  let cursor: string;
  if (dates.has(today)) cursor = today;
  else if (dates.has(yesterday)) cursor = yesterday;
  else return { current: 0, best: longestRun(dates), totalDays };

  let current = 0;
  while (dates.has(cursor)) {
    current++;
    cursor = shiftDate(cursor, -1);
  }

  return { current, best: Math.max(current, longestRun(dates)), totalDays };
}

function longestRun(dates: Set<string>): number {
  let best = 0;
  for (const d of dates) {
    // Only start counting from the beginning of a run
    if (dates.has(shiftDate(d, -1))) continue;
    let len = 1;
    let cursor = shiftDate(d, 1);
    while (dates.has(cursor)) {
      len++;
      cursor = shiftDate(cursor, 1);
    }
    if (len > best) best = len;
  }
  return best;
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
