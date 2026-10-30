import type { Question } from "@/components/QuestionCard";

/**
 * Answer-order shuffling. Showing the four options in a fixed order lets learners
 * memorize "it's ג" instead of the content, so practice and exam modes present
 * them in a per-session order. Options that refer to the other options
 * ("כל התשובות נכונות") stay pinned to the end, where they read naturally.
 */

const SHUFFLE_KEY = "theory-il:shuffleAnswers";
const PINNED_LAST = /כל התשובות|אף אחת מהתשובות/;

export function isShuffleEnabled(): boolean {
  if (typeof window === "undefined") return true;
  try {
    return localStorage.getItem(SHUFFLE_KEY) !== "0";
  } catch {
    return true;
  }
}

export function setShuffleEnabled(on: boolean): void {
  try {
    if (on) localStorage.removeItem(SHUFFLE_KEY);
    else localStorage.setItem(SHUFFLE_KEY, "0");
  } catch {
    // ignore quota / privacy-mode errors
  }
}

function hash(seed: string): number {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/** Small deterministic PRNG so the same (question, seed) always yields the same order. */
function mulberry32(a: number): () => number {
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Display order for a question's answers: `order[displayPos] = originalIndex`.
 * seed 0 means "don't shuffle" (identity) — used for the server render.
 */
export function answerOrder(answers: readonly string[], id: string, seed: number): number[] {
  const identity = answers.map((_, i) => i);
  if (seed === 0) return identity;

  const pinned = identity.filter((i) => PINNED_LAST.test(answers[i]));
  const free = identity.filter((i) => !PINNED_LAST.test(answers[i]));
  const rand = mulberry32(hash(`${seed}:${id}`));
  for (let i = free.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [free[i], free[j]] = [free[j], free[i]];
  }
  return [...free, ...pinned];
}

/** Returns a copy of the question with answers physically reordered and correctIndex remapped. */
export function withShuffledAnswers(q: Question, seed: number): Question {
  const order = answerOrder(q.answers, q.id, seed);
  const answers = order.map((i) => q.answers[i]) as Question["answers"];
  const answersEn = q.answersEn
    ? (order.map((i) => q.answersEn![i]) as Question["answersEn"])
    : undefined;
  const correctIndex = order.indexOf(q.correctIndex) as Question["correctIndex"];
  return { ...q, answers, ...(answersEn ? { answersEn } : {}), correctIndex };
}

export function randomSeed(): number {
  return (Math.floor(Math.random() * 0xffffffff) >>> 0) || 1;
}

let sessionSeed: number | null = null;

/**
 * One seed per page session (stable while the tab is open, so revisiting a
 * question shows the same order). Returns 0 when shuffling is disabled.
 */
export function getSessionSeed(): number {
  if (!isShuffleEnabled()) return 0;
  if (sessionSeed === null) sessionSeed = randomSeed();
  return sessionSeed;
}

/** Synchronous peek used for the initial render: 0 until the client has a seed. */
export function peekSessionSeed(): number {
  return sessionSeed !== null && isShuffleEnabled() ? sessionSeed : 0;
}
