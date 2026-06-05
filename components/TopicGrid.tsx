"use client";

import Link from "next/link";

interface TopicItem {
  key: string;
  label: string;
  count: number;
}

interface TopicGridProps {
  topics: TopicItem[];
}

const TOPIC_ICON: Record<string, string> = {
  "חוקי התנועה": "📋",
  "תמרורים": "🚦",
  "בטיחות": "🛡️",
  "הכרת הרכב": "🔧",
};

export default function TopicGrid({ topics }: TopicGridProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 w-full max-w-5xl">
      {topics.map((t) => (
        <Link
          key={t.key}
          href={`/study/${encodeURIComponent(t.key)}`}
          className="th-card-hover flex flex-col gap-3 p-6 rounded-[var(--th-radius)] bg-[var(--th-card)] border border-[var(--th-border)] min-h-[9rem]"
        >
          <span className="text-3xl" aria-hidden>
            {TOPIC_ICON[t.label] ?? "📄"}
          </span>
          <div className="flex flex-col gap-1 flex-1">
            <span className="text-xl font-bold leading-snug">{t.label}</span>
            <span className="text-sm text-[var(--th-muted)]">{t.count} שאלות</span>
          </div>
          <div className="h-1 w-full bg-[var(--th-muted-bg)] rounded-full overflow-hidden">
            <div className="h-full bg-[var(--th-accent)] rounded-full" style={{ width: "0%" }} />
          </div>
        </Link>
      ))}
    </div>
  );
}
