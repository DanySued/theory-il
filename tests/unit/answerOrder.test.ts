import { describe, expect, it } from "vitest";
import { answerOrder, withShuffledAnswers, isShuffleEnabled, setShuffleEnabled } from "@/lib/answerOrder";
import { ALL, q } from "./fixtures";

describe("answerOrder", () => {
  it("is the identity for seed 0 (server render)", () => {
    expect(answerOrder(["a", "b", "c", "d"], "1", 0)).toEqual([0, 1, 2, 3]);
  });

  it("is a deterministic permutation for a given seed", () => {
    const a = answerOrder(["a", "b", "c", "d"], "0042", 1234);
    expect([...a].sort()).toEqual([0, 1, 2, 3]);
    expect(answerOrder(["a", "b", "c", "d"], "0042", 1234)).toEqual(a);
  });

  it("varies across seeds", () => {
    const orders = new Set(
      Array.from({ length: 30 }, (_, s) => answerOrder(["a", "b", "c", "d"], "7", s + 1).join())
    );
    expect(orders.size).toBeGreaterThan(5);
  });

  it("keeps 'כל התשובות נכונות' pinned last", () => {
    const answers = ["x", "כל התשובות נכונות.", "y", "z"];
    for (let s = 1; s < 50; s++) {
      expect(answerOrder(answers, "1703", s).at(-1)).toBe(1);
    }
  });
});

describe("withShuffledAnswers", () => {
  it("keeps the correct answer text correct for every corpus question", () => {
    for (const question of ALL) {
      const shuffled = withShuffledAnswers(question, 99);
      expect(shuffled.answers[shuffled.correctIndex]).toBe(question.answers[question.correctIndex]);
      expect([...shuffled.answers].sort()).toEqual([...question.answers].sort());
    }
  });

  it("does not mutate the input", () => {
    const original = q("1", "בטיחות", 2);
    const copy = structuredClone(original);
    withShuffledAnswers(original, 5);
    expect(original).toEqual(copy);
  });
});

describe("shuffle preference", () => {
  it("defaults on and persists off", () => {
    expect(isShuffleEnabled()).toBe(true);
    setShuffleEnabled(false);
    expect(isShuffleEnabled()).toBe(false);
    setShuffleEnabled(true);
    expect(isShuffleEnabled()).toBe(true);
  });
});
