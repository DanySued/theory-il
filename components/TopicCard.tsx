import Link from "next/link";
import type { ReactNode } from "react";

interface Props {
  href: string;
  title: string;
  meta?: ReactNode;
  index?: number;
  accentDot?: string;
  badge?: ReactNode;
  progress?: ReactNode;
}

export default function TopicCard({
  href,
  title,
  meta,
  index,
  accentDot,
  badge,
  progress,
}: Props) {
  return (
    <Link
      href={href}
      className="group relative flex flex-col gap-3 p-6 rounded-[var(--th-radius-lg)] bg-[var(--th-card)] border border-[var(--th-border)] hover:border-[var(--th-accent)] hover:shadow-[0_8px_24px_-12px_rgba(29,78,216,0.25)] hover:-translate-y-0.5 transition-all"
    >
      <div className="flex items-baseline justify-between">
        {typeof index === "number" ? (
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
