import Link from "next/link";
import type { ReactNode } from "react";

interface Props {
  href: string;
  title: string;
  meta?: ReactNode;
  index?: number;
  tag?: string;
  accentDot?: string;
  badge?: ReactNode;
  progress?: ReactNode;
}

export default function TopicCard({
  href,
  title,
  meta,
  index,
  tag,
  accentDot,
  badge,
  progress,
}: Props) {
  return (
    <Link
      href={href}
      className="group relative flex flex-col gap-3 p-6 rounded-[var(--th-radius-lg)] bg-[var(--th-card)] border border-[var(--th-border)] hover:border-[var(--th-accent)] hover:shadow-[var(--th-shadow-accent)] hover:-translate-y-0.5 transition-all"
    >
      <div className="flex items-baseline justify-between">
        {tag ? (
          <span className="inline-flex items-center gap-1.5 text-[0.7rem] font-bold text-[var(--th-accent)] bg-[var(--th-accent-soft)] px-2 py-0.5 rounded-full">
            <span aria-hidden className="w-1 h-1 rounded-full bg-[var(--th-accent)]" />
            {tag}
          </span>
        ) : typeof index === "number" ? (
          <span className="text-[0.7rem] font-bold tracking-[0.18em] text-[var(--th-muted)] tabular-nums">
            {String(index + 1).padStart(2, "0")}
          </span>
        ) : accentDot ? (
          <span
            aria-hidden
            className="w-3 h-3 rounded-full shrink-0"
            style={{ background: accentDot }}
          />
        ) : (
          <span aria-hidden />
        )}
        <span
          aria-hidden
          className="text-[var(--th-muted)] group-hover:text-[var(--th-accent)] group-hover:-translate-x-1 transition-all ms-2"
        >
          ←
        </span>
      </div>
      <div className="flex flex-col gap-1">
        <span className="text-2xl font-extrabold tracking-tight leading-tight text-[var(--th-fg)]">
          {title}
        </span>
        {meta && (
          <span className="text-sm text-[var(--th-muted)]">{meta}</span>
        )}
      </div>
      {badge}
      {progress}
    </Link>
  );
}
