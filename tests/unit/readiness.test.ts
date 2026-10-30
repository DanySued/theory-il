import { describe, expect, it } from "vitest";
import { binomialTail, estimateReadiness, examTrend, UNSEEN_BASELINE } from "@/lib/readiness";
import type { QuestionStats } from "@/lib/storage";
import { TOPIC_COUNTS } from "@/lib/data/topics";
import { ALL } from "./fixtures";

const topicById = new Map(ALL.map((x) => [x.id, x.topic]));
const topicOf = (id: string) => topicById.get(id);
const stats = (ids: string[], correct: number, wrong: number) =>
  Object.fromEntries(
    ids.map((id): [string, QuestionStats] => [id, { id, correct, wrong, seen: correct + wrong, lastSeen: 0 }])
  );

describe("binomialTail", () => {
  it("matches known values", () => {
    expect(binomialTail(30, 0.5, 0)).toBeCloseTo(1);
    expect(binomialTail(30, 1, 26)).toBe(1);
    expect(binomialTail(30, 0, 26)).toBe(0);
    expect(binomialTail(2, 0.5, 1)).toBeCloseTo(0.75);
  });
});

describe("estimateReadiness", () => {
  it("starts at the unseen baseline with no data", () => {
    const r = estimateReadiness({}, topicOf, TOPIC_COUNTS);
    expect(r.enoughData).toBe(false);
    expect(r.expectedScore).toBeCloseTo(30 * UNSEEN_BASELINE);
  });

  it("does not claim exam-readiness from a few easy questions", () => {
    const ids = ALL.slice(0, 30).map((x) => x.id);
    const r = estimateReadiness(stats(ids, 1, 0), topicOf, TOPIC_COUNTS);
    expect(r.enoughData).toBe(true);
    expect(r.expectedScore).toBeLessThan(18);
    expect(r.passChance).toBeLessThan(0.01);
  });

  it("approaches a pass when the whole bank is mastered", () => {
    const r = estimateReadiness(stats(ALL.map((x) => x.id), 3, 0), topicOf, TOPIC_COUNTS);
    expect(r.expectedScore).toBeGreaterThan(28);
    expect(r.passChance).toBeGreaterThan(0.9);
  });

  it("names the weakest practiced topic", () => {
    const signs = ALL.filter((x) => x.topic === "תמרורים").slice(0, 20).map((x) => x.id);
    const law = ALL.filter((x) => x.topic === "חוקי התנועה").slice(0, 20).map((x) => x.id);
    const r = estimateReadiness({ ...stats(signs, 0, 2), ...stats(law, 2, 0) }, topicOf, TOPIC_COUNTS);
    expect(r.weakestTopic).toBe("תמרורים");
  });
});

describe("examTrend", () => {
  it("compares this week's full exams with last week's", () => {
    const now = 100 * 86_400_000;
    const day = 86_400_000;
    const t = examTrend(
      [
        { startedAt: now - 1 * day, score: 26, length: 30 },
        { startedAt: now - 2 * day, score: 24, length: 30 },
        { startedAt: now - 9 * day, score: 20, length: 30 },
        { startedAt: now - 1 * day, score: 5, length: 10 }, // not a full exam
      ],
      now
    );
    expect(t).toEqual({ thisWeek: 25, lastWeek: 20, delta: 5 });
  });
});
