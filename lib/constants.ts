import type { SignCategory } from "@/lib/data/signs";

export const LABELS = ["א", "ב", "ג", "ד"] as const;

export const CATEGORY_ORDER: SignCategory[] = [
  "אזהרה",
  "חובה",
  "איסור",
  "מידע",
  "סימוני כביש",
];

/** Official ב exam shape: 30 questions, 40 minutes, pass with at most 4 mistakes. */
export const EXAM_LENGTH = 30;
export const PASS_SCORE = 26;

/** Questions per topic in a 30-question exam (scaled for other lengths). */
export const EXAM_TOPIC_ALLOC: Record<string, number> = {
  "חוקי התנועה": 12,
  "תמרורים": 9,
  "בטיחות": 7,
  "הכרת הרכב": 2,
};
