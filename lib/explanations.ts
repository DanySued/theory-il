"use client";

import { useEffect, useState } from "react";

/**
 * Explanations live in their own JSON (lib/data/explanations.json, id → text) and are
 * fetched lazily the first time an answer is revealed, so they never weigh down the
 * initial page or the corpus chunk. They are study aids written for this site, not
 * official Ministry of Transport text — the UI labels them as such.
 */

let cache: Record<string, string> | null = null;
let inflight: Promise<Record<string, string>> | null = null;

export function loadExplanations(): Promise<Record<string, string>> {
  if (cache) return Promise.resolve(cache);
  if (!inflight) {
    inflight = import("@/lib/data/explanations.json")
      .then((m) => (cache = m.default as Record<string, string>))
      .catch(() => (cache = {}))
      .finally(() => {
        inflight = null;
      });
  }
  return inflight;
}

/** The explanation for a question, loading the bundle on demand once `enabled` is true. */
export function useExplanation(
  question: { id: string; explanation?: string },
  enabled: boolean
): string | undefined {
  const [map, setMap] = useState<Record<string, string> | null>(cache);
  useEffect(() => {
    if (!enabled || map) return;
    let alive = true;
    loadExplanations().then((m) => alive && setMap(m));
    return () => {
      alive = false;
    };
  }, [enabled, map]);
  return question.explanation ?? map?.[question.id];
}
