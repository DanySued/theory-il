// Corpus-free daily-challenge status helpers.
// Kept separate from lib/dailyChallenge.ts (which statically imports the ~400KB
// question corpus) so that NavStreakBadge — rendered in the root layout on every
// page — does not drag questions.json into the global client bundle.
import { localDateStr } from "@/lib/utils";

export const DAILY_KEY = "theory-il:dailyChallenge";

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

export function isDailyCompletedToday(): boolean {
  const rec = getDailyChallengeRecord();
  return rec !== null && rec.date === localDateStr(new Date());
}
