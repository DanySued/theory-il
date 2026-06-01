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

export default function TopicGrid({ topics }: TopicGridProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-2xl">
      {topics.map((t) => (
        <Link
          key={t.key}
          href={`/study/${encodeURIComponent(t.key)}`}
          className="flex flex-col gap-2 p-6 rounded-[var(--th-radius)] bg-[var(--th-card)] border border-[var(--th-border)] hover:border-[var(--th-accent)] hover:shadow-sm transition-all"
        >
          <span className="text-xl font-bold">{t.label}</span>
          <span className="text-sm text-[var(--th-muted)]">{t.count} שאלות</span>
          <div className="mt-2 h-1 w-full bg-[var(--th-muted-bg)] rounded-full overflow-hidden">
            <div
              className="h-full bg-[var(--th-accent)] rounded-full"
              style={{ width: "0%" }}
            />
          </div>
        </Link>
      ))}
    </div>
  );
}
