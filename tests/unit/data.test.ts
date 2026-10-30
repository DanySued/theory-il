import { describe, expect, it } from "vitest";
import { TOPIC_COUNTS, TOTAL_QUESTIONS } from "@/lib/data/topics";
import { ALL } from "./fixtures";

describe("question corpus", () => {
  it("matches the precomputed topic counts used by light pages", () => {
    const counts: Record<string, number> = {};
    for (const x of ALL) counts[x.topic] = (counts[x.topic] ?? 0) + 1;
    expect(counts).toEqual(TOPIC_COUNTS);
    expect(ALL).toHaveLength(TOTAL_QUESTIONS);
  });

  it("has well-formed questions with unique ids", () => {
    expect(new Set(ALL.map((x) => x.id)).size).toBe(ALL.length);
    for (const x of ALL) {
      expect(x.answers).toHaveLength(4);
      expect(x.correctIndex).toBeGreaterThanOrEqual(0);
      expect(x.correctIndex).toBeLessThanOrEqual(3);
      expect(x.text.trim().length).toBeGreaterThan(0);
    }
  });
});

describe("explanations", () => {
  it("only reference real questions and are non-empty", async () => {
    const explanations = (await import("@/lib/data/explanations.json")).default as Record<string, string>;
    const ids = new Set(ALL.map((x) => x.id));
    for (const [id, text] of Object.entries(explanations)) {
      expect(ids.has(id), id).toBe(true);
      expect(text.trim().length).toBeGreaterThan(10);
    }
  });
});
