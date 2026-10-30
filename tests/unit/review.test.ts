import { describe, expect, it } from "vitest";
import { rankQuestions, reviewDeckSummary } from "@/lib/review";
import type { QuestionStats } from "@/lib/storage";
import { q } from "./fixtures";

const NOW = 1_800_000_000_000;
const stat = (id: string, correct: number, wrong: number, daysAgo = 0): QuestionStats => ({
  id,
  correct,
  wrong,
  seen: correct + wrong,
  lastSeen: NOW - daysAgo * 86_400_000,
});

describe("rankQuestions", () => {
  it("ranks wrong-heavy questions above unseen ones and drops mastered ones", () => {
    const questions = [q("mastered"), q("unseen"), q("missed")];
    const stats = { mastered: stat("mastered", 3, 0), missed: stat("missed", 0, 2) };
    const ranked = rankQuestions({ questions, stats, bookmarks: new Set(), now: NOW }, 10);
    expect(ranked.map((x) => x.id)).toEqual(["missed", "unseen"]);
  });

  it("caps one topic so a weak area doesn't take over the deck", () => {
    const weak = Array.from({ length: 20 }, (_, i) => q(`w${i}`, "תמרורים"));
    const other = ["בטיחות", "חוקי התנועה", "הכרת הרכב"].flatMap((t) =>
      Array.from({ length: 5 }, (_, i) => q(`${t}${i}`, t))
    );
    const stats = Object.fromEntries(weak.map((x) => [x.id, stat(x.id, 0, 1)]));
    const ranked = rankQuestions({ questions: [...weak, ...other], stats, bookmarks: new Set(), now: NOW }, 9);
    expect(ranked.filter((x) => x.topic === "תמרורים")).toHaveLength(3);
    expect(ranked).toHaveLength(9);
  });

  it("backfills past the cap rather than returning a short deck", () => {
    const weak = Array.from({ length: 20 }, (_, i) => q(`w${i}`, "תמרורים"));
    const stats = Object.fromEntries(weak.map((x) => [x.id, stat(x.id, 0, 1)]));
    expect(rankQuestions({ questions: weak, stats, bookmarks: new Set(), now: NOW }, 9)).toHaveLength(9);
  });

  it("gives bookmarks a boost", () => {
    const ranked = rankQuestions(
      { questions: [q("a"), q("b")], stats: {}, bookmarks: new Set(["b"]), now: NOW },
      1
    );
    expect(ranked[0].id).toBe("b");
  });
});

describe("reviewDeckSummary", () => {
  it("counts new, wrong and bookmarked", () => {
    const s = reviewDeckSummary([q("a"), q("b"), q("c")], { a: stat("a", 0, 1), b: stat("b", 1, 0) }, new Set(["c"]));
    expect(s).toEqual({ total: 3, wrongCount: 1, newCount: 1, bookmarkCount: 1 });
  });
});
