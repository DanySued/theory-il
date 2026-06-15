"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getLastSession, type ResumeTarget } from "@/lib/lastSession";

export default function ContinueTile() {
  const [target, setTarget] = useState<ResumeTarget | null | "loading">("loading");

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setTarget(getLastSession());
  }, []);

  if (target === "loading" || target === null) return null;

  return (
    <Link
      href={target.href}
      className="group w-full flex items-center gap-4 p-5 rounded-[var(--th-radius-lg)] bg-[var(--th-card)] border border-[var(--th-border)] hover:border-[var(--th-accent)] hover:shadow-[var(--th-shadow-accent)] hover:-translate-y-0.5 transition-all"
    >
      <span
        aria-hidden
        className="shrink-0 inline-flex items-center justify-center w-11 h-11 rounded-full bg-[var(--th-accent-soft)] text-[var(--th-accent)] text-lg font-bold"
      >
        ↺
      </span>
      <div className="flex flex-col gap-1 min-w-0 flex-1">
        <span className="th-eyebrow">{target.eyebrow}</span>
        <span className="text-lg font-extrabold tracking-tight text-[var(--th-fg)] truncate">
          {target.title}
        </span>
        <span className="text-sm text-[var(--th-muted)] truncate">{target.subtitle}</span>
      </div>
      <span
        aria-hidden
        className="shrink-0 text-[var(--th-muted)] group-hover:text-[var(--th-accent)] group-hover:-translate-x-1 transition-all text-xl"
      >
        ←
      </span>
    </Link>
  );
}
