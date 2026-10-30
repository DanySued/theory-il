"use client"; // Error boundaries must be Client Components

import { useEffect } from "react";
import Link from "next/link";
import PageShell from "@/components/PageShell";

export default function Error({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <PageShell showBack={false}>
      <div className="flex flex-col items-center text-center gap-4 py-12">
        <span className="th-eyebrow">משהו השתבש</span>
        <h1 className="th-page-title">אופס, הדף לא נטען</h1>
        <p className="th-body max-w-md">
          ההתקדמות שלך שמורה בדפדפן ולא נמחקה. אפשר לנסות שוב, או לחזור לדף הבית ולהמשיך משם.
        </p>
        <div className="flex flex-wrap justify-center gap-3 pt-2">
          <button
            type="button"
            onClick={() => unstable_retry()}
            className="inline-flex items-center justify-center h-11 px-5 rounded-[var(--th-radius-lg)] bg-[var(--th-accent)] text-[var(--th-on-accent)] text-sm font-semibold hover:bg-[var(--th-accent-hover)] transition-colors"
          >
            נסה שוב
          </button>
          <Link
            href="/"
            className="inline-flex items-center justify-center h-11 px-5 rounded-[var(--th-radius-lg)] border border-[var(--th-border)] text-sm font-semibold text-[var(--th-fg)] hover:bg-[var(--th-muted-bg)] transition-colors"
          >
            לדף הבית
          </Link>
        </div>
      </div>
    </PageShell>
  );
}
