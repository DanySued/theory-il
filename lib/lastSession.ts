import { getLastDrill, listAttempts } from "@/lib/storage";
import { TOPIC_COUNTS } from "@/lib/data/topics";

export interface ResumeTarget {
  kind: "drill" | "attempt";
  href: string;
  eyebrow: string;
  title: string;
  subtitle: string;
  ts: number;
  /** Short stat for compact cards ("27/30 נכון", "שאלה 48 מתוך 361"). */
  meta: string;
  /** Drill only: 1-based position and topic size, for a progress bar. */
  position?: { current: number; total: number };
}

function timeAgo(ts: number): string {
  const diffMs = Date.now() - ts;
  const mins = Math.floor(diffMs / 60_000);
  if (mins < 1) return "ממש עכשיו";
  if (mins < 60) return `לפני ${mins} דקות`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return hrs === 1 ? "לפני שעה" : `לפני ${hrs} שעות`;
  const days = Math.floor(hrs / 24);
  if (days === 1) return "אתמול";
  if (days < 7) return `לפני ${days} ימים`;
  if (days < 30) return `לפני ${Math.floor(days / 7)} שבועות`;
  return `לפני ${Math.floor(days / 30)} חודשים`;
}

/**
 * Pick the single most useful "resume" target based on recent activity.
 * Drill beats attempt-review when both are recent; we surface the freshest signal.
 */
export function getLastSession(): ResumeTarget | null {
  if (typeof window === "undefined") return null;

  const candidates: ResumeTarget[] = [];

  const drill = getLastDrill();
  if (drill) {
    const topicTotal = TOPIC_COUNTS[drill.topic] ?? 0;
    if (topicTotal > 0) {
      const current = Math.min(drill.index + 1, topicTotal);
      candidates.push({
        kind: "drill",
        // Resume straight into practice, not the topic's study guide.
        href: `/study/${encodeURIComponent(drill.topic)}?view=drill`,
        eyebrow: "המשך מהמקום שעצרת",
        title: drill.topic,
        subtitle: `שאלה ${current} מתוך ${topicTotal} · ${timeAgo(drill.ts)}`,
        meta: `שאלה ${current} מתוך ${topicTotal}`,
        ts: drill.ts,
        position: { current, total: topicTotal },
      });
    }
  }

  const attempts = listAttempts();
  const latest = attempts[0];
  if (latest) {
    const correct = latest.questions.filter((q, i) => latest.answers[i] === q.correctIndex).length;
    candidates.push({
      kind: "attempt",
      href: `/results/${latest.id}`,
      eyebrow: "סקירת המבחן האחרון",
      title: latest.questions.length === 30 ? "מבחן מלא" : `${latest.questions.length} שאלות`,
      subtitle: `${correct}/${latest.questions.length} נכון · ${timeAgo(latest.startedAt)}`,
      meta: `${correct}/${latest.questions.length} נכון`,
      ts: latest.startedAt,
    });
  }

  if (candidates.length === 0) return null;
  candidates.sort((a, b) => b.ts - a.ts);
  return candidates[0];
}
