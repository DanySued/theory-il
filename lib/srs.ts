import supermemo from "supermemo";
import type { SuperMemoItem, SuperMemoGrade } from "supermemo";
import { localDateStr } from "@/lib/utils";

export type SRSCard = SuperMemoItem & {
  id: string;
  dueDate: string; // "YYYY-MM-DD"
};

const SRS_KEY = "theory-il:srs";

export function getSRSCards(): Record<string, SRSCard> {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(localStorage.getItem(SRS_KEY) ?? "{}");
  } catch {
    return {};
  }
}

const NEW_CARD: SuperMemoItem = { interval: 0, repetition: 0, efactor: 2.5 };

export function reviewCard(id: string, grade: SuperMemoGrade): SRSCard {
  const cards = getSRSCards();
  const result = supermemo(cards[id] ?? NEW_CARD, grade);
  const due = new Date();
  due.setDate(due.getDate() + result.interval);
  const updated: SRSCard = {
    id,
    ...result,
    dueDate: localDateStr(due),
  };
  cards[id] = updated;
  localStorage.setItem(SRS_KEY, JSON.stringify(cards));
  return updated;
}

/** Days until the card would be due again for each grade, if rated now (reviewCard's math). */
export function previewIntervals<G extends SuperMemoGrade>(id: string, grades: readonly G[]): Record<G, number> {
  const card = getSRSCards()[id] ?? NEW_CARD;
  return Object.fromEntries(grades.map((g) => [g, supermemo(card, g).interval])) as Record<G, number>;
}

/** Cards reviewed before and due again today (never-seen cards don't count). */
export function countReviewedDue(): number {
  const today = localDateStr(new Date());
  return Object.values(getSRSCards()).filter((c) => c.dueDate <= today).length;
}

export function getDueCards(allIds: string[]): string[] {
  const cards = getSRSCards();
  const today = localDateStr(new Date());
  return allIds.filter((id) => {
    const c = cards[id];
    return !c || c.dueDate <= today;
  });
}

export function getDueCountByTopic(
  questions: { id: string; topic: string }[]
): Record<string, number> {
  const cards = getSRSCards();
  const today = localDateStr(new Date());
  const result: Record<string, number> = {};
  for (const q of questions) {
    result[q.topic] ??= 0;
    const c = cards[q.id];
    if (!c || c.dueDate <= today) {
      result[q.topic]++;
    }
  }
  return result;
}
