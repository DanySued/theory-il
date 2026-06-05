import type { Question } from "@/components/QuestionCard";

export type Attempt = {
  id: string;
  startedAt: number;
  finishedAt: number;
  questions: Question[];
  answers: (number | null)[];
  markedForReview: boolean[];
  timeSpentSeconds: number;
  answersRecorded?: boolean;
};

const KEY_PREFIX = "theory-il:attempt:";
const QSTATS_KEY = "theory-il:qstats";
const STREAK_KEY = "theory-il:streak";

// --- Attempts ---

export function saveAttempt(attempt: Attempt): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY_PREFIX + attempt.id, JSON.stringify(attempt));
}

export function getAttempt(id: string): Attempt | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(KEY_PREFIX + id);
    return raw ? (JSON.parse(raw) as Attempt) : null;
  } catch {
    return null;
  }
}

export function generateId(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

// --- Question stats ---

export type QuestionStats = {
  id: string;
  correct: number;
  wrong: number;
  seen: number;
  lastSeen: number;
};

export function getQStats(): Record<string, QuestionStats> {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(localStorage.getItem(QSTATS_KEY) ?? "{}");
  } catch {
    return {};
  }
}

export function recordAnswer(questionId: string, wasCorrect: boolean): void {
  if (typeof window === "undefined") return;
  const stats = getQStats();
  const s = stats[questionId] ?? { id: questionId, correct: 0, wrong: 0, seen: 0, lastSeen: 0 };
  s.seen++;
  s.lastSeen = Date.now();
  if (wasCorrect) s.correct++;
  else s.wrong++;
  stats[questionId] = s;
  localStorage.setItem(QSTATS_KEY, JSON.stringify(stats));
}

export function recordAnswersBatch(
  questions: Question[],
  answers: (number | null)[]
): void {
  if (typeof window === "undefined") return;
  const stats = getQStats();
  const now = Date.now();
  for (let i = 0; i < questions.length; i++) {
    const q = questions[i];
    const a = answers[i];
    if (a === null) continue;
    const s = stats[q.id] ?? { id: q.id, correct: 0, wrong: 0, seen: 0, lastSeen: 0 };
    s.seen++;
    s.lastSeen = now;
    if (a === q.correctIndex) s.correct++;
    else s.wrong++;
    stats[q.id] = s;
  }
  localStorage.setItem(QSTATS_KEY, JSON.stringify(stats));
}

// --- Streak ---

export type StreakData = {
  current: number;
  longest: number;
  lastStudyDate: string; // "YYYY-MM-DD"
};

export function getStreak(): StreakData {
  if (typeof window === "undefined") return { current: 0, longest: 0, lastStudyDate: "" };
  try {
    const raw = localStorage.getItem(STREAK_KEY);
    return raw ? (JSON.parse(raw) as StreakData) : { current: 0, longest: 0, lastStudyDate: "" };
  } catch {
    return { current: 0, longest: 0, lastStudyDate: "" };
  }
}

function localDateStr(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function todayStr(): string {
  return localDateStr(new Date());
}

function yesterdayStr(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return localDateStr(d);
}

export function updateStreak(): StreakData {
  if (typeof window === "undefined") return { current: 0, longest: 0, lastStudyDate: "" };
  const streak = getStreak();
  const today = todayStr();
  if (streak.lastStudyDate === today) return streak;
  const newCurrent =
    streak.lastStudyDate === yesterdayStr() ? streak.current + 1 : 1;
  const updated: StreakData = {
    current: newCurrent,
    longest: Math.max(newCurrent, streak.longest),
    lastStudyDate: today,
  };
  localStorage.setItem(STREAK_KEY, JSON.stringify(updated));
  return updated;
}
