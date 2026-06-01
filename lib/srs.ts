import supermemo from "supermemo";
import type { SuperMemoItem, SuperMemoGrade } from "supermemo";

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

export function reviewCard(id: string, grade: SuperMemoGrade): SRSCard {
  const cards = getSRSCards();
  const existing: SuperMemoItem = cards[id] ?? { interval: 0, repetition: 0, efactor: 2.5 };
  const result = supermemo(existing, grade);
  const due = new Date();
  due.setDate(due.getDate() + result.interval);
  const updated: SRSCard = {
    id,
    ...result,
    dueDate: due.toISOString().slice(0, 10),
  };
  cards[id] = updated;
  localStorage.setItem(SRS_KEY, JSON.stringify(cards));
  return updated;
}

export function getDueCards(allIds: string[]): string[] {
  const cards = getSRSCards();
  const today = new Date().toISOString().slice(0, 10);
  return allIds.filter((id) => {
    const c = cards[id];
    return !c || c.dueDate <= today;
  });
}

export function getDueCountByTopic(
  questions: { id: string; topic: string }[]
): Record<string, number> {
  const cards = getSRSCards();
  const today = new Date().toISOString().slice(0, 10);
  const result: Record<string, number> = {};
  for (const q of questions) {
    const c = cards[q.id];
    if (!c || c.dueDate <= today) {
      result[q.topic] = (result[q.topic] ?? 0) + 1;
    }
  }
  return result;
}
