import { describe, expect, it, vi, afterEach } from "vitest";
import { pickDailyDeck, getDailyStreak, DAILY_DECK_SIZE } from "@/lib/dailyChallenge";
import type { QuestionStats } from "@/lib/storage";
import { ALL } from "./fixtures";

afterEach(() => vi.useRealTimers());

describe("pickDailyDeck", () => {
  it("is deterministic per date and rotates across dates", () => {
    const a = pickDailyDeck(ALL, "2026-10-01", {}).map((x) => x.id);
    expect(a).toHaveLength(DAILY_DECK_SIZE);
    expect(pickDailyDeck(ALL, "2026-10-01", {}).map((x) => x.id)).toEqual(a);
    expect(pickDailyDeck(ALL, "2026-10-02", {}).map((x) => x.id)).not.toEqual(a);
  });

  it("prefers questions the learner got wrong", () => {
    const missed = ALL[500];
    const stats: Record<string, QuestionStats> = {
      [missed.id]: { id: missed.id, correct: 0, wrong: 1, seen: 1, lastSeen: 0 },
    };
    expect(pickDailyDeck(ALL, "2026-10-01", stats)[0].id).toBe(missed.id);
  });
});

describe("getDailyStreak", () => {
  it("keeps the streak alive until a day is actually skipped", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 9, 10, 12));
    const h = ["2026-10-07", "2026-10-08", "2026-10-09"].map((date) => ({ date, correctCount: 3 }));
    expect(getDailyStreak(h)).toEqual({ current: 3, best: 3, totalDays: 3 });
    vi.setSystemTime(new Date(2026, 9, 11, 12));
    expect(getDailyStreak(h).current).toBe(0);
  });
});
