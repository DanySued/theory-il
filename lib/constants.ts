import type { SignCategory } from "@/lib/data/signs";

export const LABELS = ["א", "ב", "ג", "ד"] as const;

export const CATEGORY_ORDER: SignCategory[] = [
  "אזהרה",
  "חובה",
  "איסור",
  "מידע",
  "סימוני כביש",
];
