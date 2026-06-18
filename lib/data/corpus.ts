import type { Question } from "@/components/QuestionCard";

let cache: Question[] | null = null;
let inflight: Promise<Question[]> | null = null;

/** Lazily load the full question corpus once, client-side, and reuse it. */
export function loadCorpus(): Promise<Question[]> {
  if (cache) return Promise.resolve(cache);
  if (!inflight) {
    inflight = import("@/lib/data/questions.json").then((m) => {
      cache = m.default as Question[];
      inflight = null;
      return cache;
    });
  }
  return inflight;
}

/** Synchronous peek — null until loadCorpus() has resolved at least once. */
export function getCorpusSync(): Question[] | null {
  return cache;
}
