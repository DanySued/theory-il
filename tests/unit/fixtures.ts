import type { Question } from "@/components/QuestionCard";
import corpus from "@/lib/data/questions.json";

export const ALL = corpus as Question[];

export function q(id: string, topic = "בטיחות", correctIndex: 0 | 1 | 2 | 3 = 0): Question {
  return { id, topic, text: `שאלה ${id}`, answers: ["א", "ב", "ג", "ד"], correctIndex };
}
