"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getQStats } from "@/lib/storage";
import { getLastSession, type ResumeTarget } from "@/lib/lastSession";
import { estimateReadiness, READINESS_MIN_SEEN, type Readiness } from "@/lib/readiness";
import { EXAM_LENGTH } from "@/lib/constants";
import { TOPIC_COUNTS } from "@/lib/data/topics";

const TOPIC_KEYS = Object.keys(TOPIC_COUNTS);

function formatChance(p: number): string {
  // Bidi-safe: a literal "<1%" renders as "1%>" inside RTL text.
  return p < 0.01 ? "פחות מ-1%" : `${Math.round(p * 100)}%`;
}

interface Props {
  /** question id → index into TOPIC_KEYS; lets us score readiness without loading the corpus */
  topicIndex: Record<string, number>;
}

/**
 * Home hero actions for someone who has studied before. Shown via CSS only when the
 * boot script marked <html data-returning>, so first-time visitors never see it flash.
 */
export default function ReturningHero({ topicIndex }: Props) {
  const [state, setState] = useState<{ resume: ResumeTarget | null; r: Readiness } | null>(null);

  useEffect(() => {
    const r = estimateReadiness(getQStats(), (id) => TOPIC_KEYS[topicIndex[id]], TOPIC_COUNTS);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setState({ resume: getLastSession(), r });
  }, [topicIndex]);

  const r = state?.r;
  const resume = state?.resume;

  return (
    <div className="flex flex-col items-center gap-5 w-full">
      <div
        className="w-full max-w-sm rounded-[var(--th-radius-lg)] border border-[var(--th-border)] bg-[var(--th-card)] px-5 py-4 flex items-center justify-between gap-4 min-h-[76px]"
        aria-live="polite"
      >
        {!r ? (
          <span className="h-5 w-40 rounded bg-[var(--th-muted-bg)] animate-pulse" />
        ) : r.enoughData ? (
          <>
            <div className="flex flex-col items-start gap-0.5">
              <span className="th-caption">ציון משוער במבחן</span>
              <span className="text-2xl font-extrabold tabular-nums text-[var(--th-fg)]">
                {Math.round(r.expectedScore)}
                <span className="text-base text-[var(--th-muted)]">/{EXAM_LENGTH}</span>
              </span>
            </div>
            <div className="flex flex-col items-end gap-0.5">
              <span className="th-caption">סיכוי לעבור</span>
              <span className="text-2xl font-extrabold tabular-nums text-[var(--th-accent)]">
                {formatChance(r.passChance)}
              </span>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-start gap-1.5 w-full">
            <span className="text-sm text-[var(--th-muted-strong)]">
              ענית על {r.seen} שאלות — עוד {READINESS_MIN_SEEN - r.seen} וניתן לך ציון משוער
            </span>
            <div className="h-1.5 w-full bg-[var(--th-muted-bg)] rounded-full overflow-hidden">
              <div
                className="h-full bg-[var(--th-accent)] rounded-full"
                style={{ width: `${(r.seen / READINESS_MIN_SEEN) * 100}%` }}
              />
            </div>
          </div>
        )}
      </div>

      <Link
        href={resume?.href ?? "/review"}
        className="inline-flex flex-col items-center justify-center min-h-14 py-2 w-full max-w-xs rounded-[var(--th-radius-lg)] bg-[var(--th-accent)] text-[var(--th-on-accent)] font-semibold shadow-sm hover:bg-[var(--th-accent-hover)] hover:shadow-md transition-all"
      >
        <span className="text-base">
          {resume ? (resume.kind === "drill" ? `המשך: ${resume.title}` : "סקירת המבחן האחרון") : "חזרה חכמה"}
          <span aria-hidden className="ms-2">←</span>
        </span>
        {resume && <span className="text-xs opacity-80">{resume.subtitle}</span>}
      </Link>
      <div className="flex items-center gap-4 text-sm">
        <Link href="/exam" className="text-[var(--th-muted)] underline underline-offset-4 hover:text-[var(--th-fg)]">
          מבחן מלא
        </Link>
        <span aria-hidden className="text-[var(--th-border-strong)]">·</span>
        <Link href="/review" className="text-[var(--th-muted)] underline underline-offset-4 hover:text-[var(--th-fg)]">
          חזרה חכמה
        </Link>
        {r?.enoughData && r.weakestTopic && (
          <>
            <span aria-hidden className="text-[var(--th-border-strong)]">·</span>
            <Link
              href={`/study/${encodeURIComponent(r.weakestTopic)}?view=drill`}
              className="text-[var(--th-muted)] underline underline-offset-4 hover:text-[var(--th-fg)]"
            >
              לחזק: {r.weakestTopic}
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
