"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import questionsData from "@/lib/data/questions.json";
import type { Question } from "@/components/QuestionCard";
import PageShell from "@/components/PageShell";
import SectionHead from "@/components/SectionHead";
import {
  getQStats,
  getStreak,
  listAttempts,
  getBookmarks,
  type Attempt,
  type QuestionStats,
} from "@/lib/storage";
import { getSRSCards } from "@/lib/srs";
import { localDateStr } from "@/lib/utils";
import { getTopicAccuracy, getMostMissed, type TopicAccuracy, type MissedQuestion } from "@/lib/progress";

const TOPIC_ORDER = ["חוקי התנועה", "תמרורים", "בטיחות", "הכרת הרכב"];
const questions = questionsData as Question[];
const PASS_SCORE = 26;
const READINESS_MIN_SEEN = 30; // min questions seen before showing readiness score
const READINESS_PASS_PCT = 87; // 26/30 = 86.7%

interface DataState {
  stats: Record<string, QuestionStats>;
  topics: TopicAccuracy[];
  missed: MissedQuestion[];
  attempts: Attempt[];
  dueCount: number;
  streakCurrent: number;
  streakLongest: number;
  bookmarkCount: number;
  readinessPct: number | null; // null = not enough data yet
  totalSeen: number;
}

export default function ProgressClient() {
  const [data, setData] = useState<DataState | null>(null);

  useEffect(() => {
    const stats = getQStats();
    const topics = getTopicAccuracy(questions, stats);
    // Sort: lowest accuracy first; topics with zero data go last
    topics.sort((a, b) => {
      if (a.seen === 0 && b.seen === 0) {
        return TOPIC_ORDER.indexOf(a.topic) - TOPIC_ORDER.indexOf(b.topic);
      }
      if (a.seen === 0) return 1;
      if (b.seen === 0) return -1;
      return a.accuracy - b.accuracy;
    });
    const missed = getMostMissed(questions, stats, 10);
    const attempts = listAttempts().slice(0, 5);
    // FIX-03: only count SRS cards that have been reviewed before and are due — not unseen questions
    const srsCards = getSRSCards();
    const today = localDateStr(new Date());
    const dueCount = Object.values(srsCards).filter((c) => c.dueDate <= today).length;
    const streak = getStreak();
    const bookmarkCount = getBookmarks().size;
    // FIX-02: weighted readiness score (only when ≥30 questions seen)
    const totalSeen = topics.reduce((s, t) => s + t.seen, 0);
    let readinessPct: number | null = null;
    if (totalSeen >= READINESS_MIN_SEEN) {
      const totalQ = questions.length;
      const weighted = topics.reduce((s, t) => s + t.accuracy * t.total, 0);
      readinessPct = Math.round((weighted / totalQ) * 100);
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setData({
      stats,
      topics,
      missed,
      attempts,
      dueCount,
      streakCurrent: streak.current,
      streakLongest: streak.longest,
      bookmarkCount,
      readinessPct,
      totalSeen,
    });
  }, []);

  const hasAnyData = data && (data.attempts.length > 0 || data.topics.some((t) => t.seen > 0));

  return (
    <PageShell>
      <SectionHead
        eyebrow="התקדמות"
        title="לאן ללכת מכאן"
        subtitle="כל הנתונים שלך במקום אחד — נקודות חולשה, מבחנים אחרונים, וכרטיסיות לחזרה."
      />

      {!data ? (
        <ProgressSkeleton />
      ) : !hasAnyData ? (
        <EmptyState />
      ) : (
        <>
          {/* Exam readiness score */}
          <ReadinessCard pct={data.readinessPct} totalSeen={data.totalSeen} />

          {/* Quick stats row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full">
            <StatCard label="רצף ימים" value={data.streakCurrent} sub={data.streakLongest > data.streakCurrent ? `שיא: ${data.streakLongest}` : undefined} />
            <StatCard label="שמורות" value={data.bookmarkCount} sub="לחזרה" href="/saved" />
            <StatCard label="לחזרה" value={data.dueCount} sub="כרטיסיות" href="/flashcards" />
            <StatCard
              label="נצפו"
              value={data.topics.reduce((s, t) => s + t.seen, 0)}
              sub={`מתוך ${questions.length}`}
            />
          </div>

          {/* Per-topic accuracy */}
          <section className="w-full flex flex-col gap-4">
            <div className="flex items-baseline justify-between">
              <h2 className="th-section-h">דיוק לפי נושא</h2>
              <span className="text-xs text-[var(--th-muted)]">החלש קודם</span>
            </div>
            <div className="flex flex-col gap-3">
              {data.topics.map((t) => (
                <TopicRow key={t.topic} t={t} />
              ))}
            </div>
          </section>

          {/* Most missed */}
          {data.missed.length > 0 && (
            <section className="w-full flex flex-col gap-4">
              <div className="flex items-baseline justify-between">
                <h2 className="th-section-h">השאלות שמפילות אותך</h2>
                <Link
                  href="/mistakes"
                  className="text-xs font-semibold text-[var(--th-accent)] hover:underline"
                >
                  תרגל את כולן ←
                </Link>
              </div>
              <div className="flex flex-col gap-2">
                {data.missed.map((m) => (
                  <MissedRow key={m.question.id} m={m} />
                ))}
              </div>
            </section>
          )}

          {/* Recent attempts */}
          {data.attempts.length > 0 && (
            <section className="w-full flex flex-col gap-4">
              <h2 className="th-section-h">מבחנים אחרונים</h2>
              <div className="flex flex-col gap-2">
                {data.attempts.map((a) => (
                  <AttemptRow key={a.id} a={a} />
                ))}
              </div>
            </section>
          )}
        </>
      )}
    </PageShell>
  );
}

function ProgressSkeleton() {
  return (
    <div className="w-full flex flex-col gap-6" aria-busy="true" aria-live="polite">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="h-20 rounded-[var(--th-radius-lg)] bg-[var(--th-muted-bg)] animate-pulse" />
        ))}
      </div>
      <div className="h-6 w-40 bg-[var(--th-muted-bg)] rounded animate-pulse" />
      {[0, 1, 2, 3].map((i) => (
        <div key={i} className="h-14 rounded-[var(--th-radius-lg)] bg-[var(--th-muted-bg)] animate-pulse" />
      ))}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="w-full text-center py-12 flex flex-col items-center gap-4">
      <div className="text-4xl" aria-hidden>
        📊
      </div>
      <p className="text-[var(--th-muted-strong)] max-w-md">
        עדיין אין נתונים להציג. התחל לתרגל ונחזור אליך עם תובנות אישיות.
      </p>
      <div className="flex gap-3 mt-2">
        <Link
          href="/exam"
          className="inline-flex items-center justify-center h-11 px-5 rounded-[var(--th-radius-lg)] bg-[var(--th-accent)] text-white text-sm font-semibold hover:bg-[var(--th-accent-hover)] transition-colors"
        >
          מבחן תרגול
        </Link>
        <Link
          href="/study"
          className="inline-flex items-center justify-center h-11 px-5 rounded-[var(--th-radius-lg)] border border-[var(--th-border)] text-sm font-medium hover:bg-[var(--th-muted-bg)] transition-colors"
        >
          לימוד לפי נושא
        </Link>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  sub,
  href,
}: {
  label: string;
  value: number | string;
  sub?: string;
  href?: string;
}) {
  const inner = (
    <div className="flex flex-col gap-1 p-4 rounded-[var(--th-radius-lg)] bg-[var(--th-card)] border border-[var(--th-border)] h-full">
      <span className="text-xs text-[var(--th-muted)] font-medium">{label}</span>
      <span className="text-2xl font-extrabold tabular-nums leading-none">{value}</span>
      {sub && <span className="text-[0.7rem] text-[var(--th-muted)] mt-1">{sub}</span>}
    </div>
  );
  if (href) {
    return (
      <Link
        href={href}
        className="block hover:border-[var(--th-accent)] hover:-translate-y-0.5 transition-all rounded-[var(--th-radius-lg)]"
      >
        {inner}
      </Link>
    );
  }
  return inner;
}

function TopicRow({ t }: { t: TopicAccuracy }) {
  const pct = Math.round(t.accuracy * 100);
  const coverage = Math.round(t.coverage * 100);
  const color =
    t.seen === 0
      ? "var(--th-muted)"
      : pct >= 85
      ? "var(--th-success)"
      : pct >= 65
      ? "var(--th-accent)"
      : "var(--th-error)";

  return (
    <Link
      href={
        t.seen > 0 && pct < 85
          ? `/study/${encodeURIComponent(t.topic)}?weak=1`
          : `/study/${encodeURIComponent(t.topic)}`
      }
      className="group flex flex-col gap-2 p-4 rounded-[var(--th-radius-lg)] bg-[var(--th-card)] border border-[var(--th-border)] hover:border-[var(--th-accent)] transition-colors"
    >
      <div className="flex items-baseline justify-between gap-3">
        <span className="font-bold text-[var(--th-fg)]">{t.topic}</span>
        <span className="text-sm tabular-nums font-semibold" style={{ color }}>
          {t.seen === 0 ? "טרם תורגל" : `${pct}%`}
        </span>
      </div>
      <div className="h-1.5 w-full bg-[var(--th-muted-bg)] rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${t.accuracy * 100}%`, background: color }}
        />
      </div>
      <div className="flex items-center justify-between text-xs text-[var(--th-muted)]">
        <span>
          {t.seen > 0
            ? `${t.correct} נכון · ${t.wrong} שגוי`
            : `${t.total} שאלות זמינות`}
        </span>
        <span>כיסוי {coverage}%</span>
      </div>
    </Link>
  );
}

function MissedRow({ m }: { m: MissedQuestion }) {
  const pct = Math.round(m.wrongRate * 100);
  return (
    <Link
      href={`/study/${encodeURIComponent(m.question.topic)}?weak=1`}
      className="flex items-center gap-3 p-3 rounded-[var(--th-radius-lg)] bg-[var(--th-card)] border border-[var(--th-border)] hover:border-[var(--th-error)] transition-colors"
    >
      <span className="shrink-0 inline-flex items-center justify-center w-10 h-10 rounded-full bg-[var(--th-error-soft)] text-[var(--th-error)] text-sm font-bold tabular-nums">
        {pct}%
      </span>
      <span className="flex-1 text-sm text-[var(--th-fg)] line-clamp-2 leading-relaxed">
        {m.question.text}
      </span>
      <span className="shrink-0 text-xs text-[var(--th-muted)] tabular-nums">
        {m.wrong}/{m.seen}
      </span>
    </Link>
  );
}

function ReadinessCard({ pct, totalSeen }: { pct: number | null; totalSeen: number }) {
  if (pct === null) {
    return (
      <div className="w-full rounded-[var(--th-radius-lg)] border border-[var(--th-border)] bg-[var(--th-card)] p-5 flex flex-col gap-2">
        <span className="text-xs text-[var(--th-muted)] font-medium uppercase tracking-wide">מוכנות לבחינה</span>
        <p className="text-sm text-[var(--th-muted-strong)]">
          ענה על {READINESS_MIN_SEEN - totalSeen} שאלות נוספות לחישוב הציון שלך
        </p>
      </div>
    );
  }
  const color =
    pct >= READINESS_PASS_PCT
      ? "var(--th-success)"
      : pct >= 70
      ? "var(--th-accent)"
      : "var(--th-error)";
  const label =
    pct >= READINESS_PASS_PCT
      ? "מוכן לבחינה ✓"
      : pct >= 70
      ? "מתקדם — המשך לתרגל"
      : "עדיין יש עבודה";
  return (
    <div
      className="w-full rounded-[var(--th-radius-lg)] border p-5 flex flex-col gap-3"
      style={{ borderColor: color, background: `color-mix(in srgb, ${color} 8%, var(--th-card))` }}
    >
      <div className="flex items-baseline justify-between gap-3">
        <span className="text-xs text-[var(--th-muted)] font-medium uppercase tracking-wide">מוכנות לבחינה</span>
        <span className="text-xs text-[var(--th-muted)]">סף מעבר: {READINESS_PASS_PCT}%</span>
      </div>
      <div className="flex items-end gap-4">
        <span className="text-5xl font-extrabold tabular-nums leading-none" style={{ color }}>
          {pct}%
        </span>
        <span className="text-sm font-semibold mb-1" style={{ color }}>{label}</span>
      </div>
      <div className="h-2 w-full bg-[var(--th-muted-bg)] rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${pct}%`, background: color }}
        />
      </div>
    </div>
  );
}

function AttemptRow({ a }: { a: Attempt }) {
  const correct = a.questions.filter((q, i) => a.answers[i] === q.correctIndex).length;
  const total = a.questions.length;
  const isFullExam = total === 30;
  const passed = isFullExam && correct >= PASS_SCORE;
  const date = new Date(a.startedAt);
  const dateStr = date.toLocaleDateString("he-IL", { day: "numeric", month: "short" });
  const color = isFullExam
    ? passed
      ? "var(--th-success)"
      : "var(--th-error)"
    : "var(--th-muted-strong)";
  return (
    <Link
      href={`/results/${a.id}`}
      className="flex items-center gap-3 p-3 rounded-[var(--th-radius-lg)] bg-[var(--th-card)] border border-[var(--th-border)] hover:border-[var(--th-accent)] transition-colors"
    >
      <span
        className="shrink-0 w-2 h-2 rounded-full"
        style={{ background: color }}
        aria-hidden
      />
      <span className="text-sm font-medium text-[var(--th-fg)]">
        {isFullExam ? "מבחן מלא" : `${total} שאלות`}
      </span>
      <span className="flex-1" />
      <span className="text-sm tabular-nums font-semibold" style={{ color }}>
        {correct}/{total}
      </span>
      <span className="shrink-0 text-xs text-[var(--th-muted)] tabular-nums w-16 text-end">
        {dateStr}
      </span>
    </Link>
  );
}
