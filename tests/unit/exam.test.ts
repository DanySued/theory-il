import { describe, expect, it } from "vitest";
import { generateExam, generateExamByTopic, generateWeakFocusExam } from "@/lib/exam";
import { recordAnswer } from "@/lib/storage";
import { ALL } from "./fixtures";

const countBy = (qs: { topic: string }[]) =>
  qs.reduce<Record<string, number>>((m, x) => ((m[x.topic] = (m[x.topic] ?? 0) + 1), m), {});

describe("generateExam", () => {
  it("builds a 30-question exam with the official topic mix and no duplicates", () => {
    const exam = generateExam(ALL);
    expect(exam).toHaveLength(30);
    expect(new Set(exam.map((x) => x.id)).size).toBe(30);
    expect(countBy(exam)).toEqual({ "חוקי התנועה": 12, "תמרורים": 9, "בטיחות": 7, "הכרת הרכב": 2 });
  });

  it("scales to other lengths exactly", () => {
    for (const n of [10, 15, 20, 45]) {
      const exam = generateExam(ALL, n);
      expect(exam).toHaveLength(n);
      expect(new Set(exam.map((x) => x.id)).size).toBe(n);
    }
  });
});

describe("generateExamByTopic", () => {
  it("draws only from the topic", () => {
    const exam = generateExamByTopic(ALL, "תמרורים", 20);
    expect(exam).toHaveLength(20);
    expect(exam.every((x) => x.topic === "תמרורים")).toBe(true);
  });
});

describe("generateWeakFocusExam", () => {
  it("puts missed questions in the deck", () => {
    const missed = ALL.filter((x) => x.topic === "בטיחות").slice(0, 5);
    for (const m of missed) recordAnswer(m.id, false);
    const exam = generateWeakFocusExam(ALL, 30);
    const ids = new Set(exam.map((x) => x.id));
    for (const m of missed) expect(ids.has(m.id)).toBe(true);
  });
});
