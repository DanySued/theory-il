import { describe, expect, it, vi, afterEach } from "vitest";
import { getQStats, recordAnswer, recordAnswersBatch, updateStreak, getStreak } from "@/lib/storage";
import { q } from "./fixtures";

afterEach(() => vi.useRealTimers());

describe("question stats", () => {
  it("records single answers", () => {
    recordAnswer("1", true);
    recordAnswer("1", false);
    expect(getQStats()["1"]).toMatchObject({ seen: 2, correct: 1, wrong: 1 });
  });

  it("records an exam batch and skips unanswered", () => {
    recordAnswersBatch([q("a", "x", 1), q("b", "x", 2), q("c")], [1, 0, null]);
    const s = getQStats();
    expect(s.a).toMatchObject({ correct: 1, wrong: 0 });
    expect(s.b).toMatchObject({ correct: 0, wrong: 1 });
    expect(s.c).toBeUndefined();
  });
});

describe("streak", () => {
  it("counts consecutive days and resets after a gap", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 9, 1, 12));
    expect(updateStreak().current).toBe(1);
    expect(updateStreak().current).toBe(1); // same day is idempotent
    vi.setSystemTime(new Date(2026, 9, 2, 12));
    expect(updateStreak().current).toBe(2);
    vi.setSystemTime(new Date(2026, 9, 5, 12));
    expect(updateStreak()).toMatchObject({ current: 1, longest: 2 });
    expect(getStreak().longest).toBe(2);
  });
});
