import type { Question } from "@/components/QuestionCard";

export type Attempt = {
  id: string;
  startedAt: number;
  finishedAt: number;
  questions: Question[];
  answers: (number | null)[];
  markedForReview: boolean[];
  timeSpentSeconds: number;
};

const KEY_PREFIX = "theory-il:attempt:";

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
