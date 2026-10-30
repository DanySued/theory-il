import Link from "next/link";
import { EXAM_LENGTH, PASS_SCORE } from "@/lib/constants";
import { READINESS_MIN_SEEN, type ExamTrend, type Readiness } from "@/lib/readiness";

function tone(r: Readiness): { color: string; label: string } {
  if (r.passChance >= 0.8) return { color: "var(--th-success)", label: "מוכן לבחינה ✓" };
  if (r.expectedScore >= 22) return { color: "var(--th-accent)", label: "קרוב — המשך לתרגל" };
  return { color: "var(--th-error)", label: "עדיין יש עבודה" };
}

export default function ReadinessCard({ r, trend }: { r: Readiness; trend?: ExamTrend }) {
  if (!r.enoughData) {
    const left = READINESS_MIN_SEEN - r.seen;
    return (
      <div className="w-full rounded-[var(--th-radius-lg)] border border-[var(--th-border)] bg-[var(--th-card)] p-5 flex flex-col gap-3">
        <span className="th-eyebrow">ציון משוער במבחן</span>
        <p className="text-sm text-[var(--th-muted-strong)]">
          ענה על עוד {left} {left === 1 ? "שאלה" : "שאלות"} ונחשב את הציון המשוער שלך ואת הסיכוי לעבור.
        </p>
        <div className="h-2 w-full bg-[var(--th-muted-bg)] rounded-full overflow-hidden">
          <div
            className="h-full rounded-full bg-[var(--th-accent)]"
            style={{ width: `${(r.seen / READINESS_MIN_SEEN) * 100}%` }}
          />
        </div>
      </div>
    );
  }

  const { color, label } = tone(r);
  const score = Math.round(r.expectedScore);
  const chance = Math.round(r.passChance * 100);
  const coverage = Math.round((r.seen / r.total) * 100);

  return (
    <div
      className="w-full rounded-[var(--th-radius-lg)] border p-5 flex flex-col gap-3"
      style={{ borderColor: color, background: `color-mix(in srgb, ${color} 8%, var(--th-card))` }}
    >
      <div className="flex items-baseline justify-between gap-3">
        <span className="th-eyebrow">ציון משוער במבחן</span>
        <span className="text-xs text-[var(--th-muted)]">
          לעבור: {PASS_SCORE}/{EXAM_LENGTH}
        </span>
      </div>
      <div className="flex items-end gap-3 flex-wrap">
        <span className="text-5xl font-extrabold tabular-nums leading-none" style={{ color }}>
          {score}
          <span className="text-2xl text-[var(--th-muted)]">/{EXAM_LENGTH}</span>
        </span>
        <span className="text-sm font-semibold mb-1" style={{ color }}>
          {label}
        </span>
      </div>
      <div className="h-2 w-full bg-[var(--th-muted-bg)] rounded-full overflow-hidden relative">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${(r.expectedScore / EXAM_LENGTH) * 100}%`, background: color }}
        />
        <span
          aria-hidden
          className="absolute inset-y-0 w-0.5 bg-[var(--th-fg)] opacity-50"
          style={{ insetInlineStart: `${(PASS_SCORE / EXAM_LENGTH) * 100}%` }}
        />
      </div>
      <dl className="grid grid-cols-3 gap-2 text-center pt-1">
        <div className="flex flex-col">
          <dt className="th-caption">סיכוי לעבור</dt>
          <dd className="font-bold tabular-nums text-[var(--th-fg)]">{chance < 1 ? "פחות מ-1%" : `${chance}%`}</dd>
        </div>
        <div className="flex flex-col">
          <dt className="th-caption">כיסוי המאגר</dt>
          <dd className="font-bold tabular-nums text-[var(--th-fg)]">{coverage}%</dd>
        </div>
        <div className="flex flex-col">
          <dt className="th-caption">מבחנים השבוע</dt>
          <dd className="font-bold tabular-nums text-[var(--th-fg)]">
            {trend?.thisWeek == null ? "—" : `${trend.thisWeek.toFixed(1)}`}
            {trend?.delta != null && trend.delta !== 0 && (
              <span
                className="ms-1 text-xs"
                style={{ color: trend.delta > 0 ? "var(--th-success)" : "var(--th-error)" }}
                title="לעומת השבוע שעבר"
              >
                {trend.delta > 0 ? "▲" : "▼"}
                {Math.abs(trend.delta).toFixed(1)}
              </span>
            )}
          </dd>
        </div>
      </dl>
      {r.weakestTopic && chance < 80 && (
        <Link
          href={`/study/${encodeURIComponent(r.weakestTopic)}?view=drill`}
          className="text-sm font-semibold text-[var(--th-accent)] hover:underline self-start"
        >
          הכי משתלם עכשיו: {r.weakestTopic} ←
        </Link>
      )}
      <p className="th-caption">
        הערכה לפי הדיוק שלך בכל נושא, כמה מהמאגר כבר ראית, ומשקל הנושא במבחן. שאלות שעוד לא ראית נספרות כ-50%.
      </p>
    </div>
  );
}
