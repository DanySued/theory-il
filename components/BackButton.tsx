"use client";

import { useRouter } from "next/navigation";

/** History back when there is somewhere to go, else a fallback route. */
export function goBack(router: ReturnType<typeof useRouter>, fallback = "/") {
  if (window.history.length > 1) router.back();
  else router.push(fallback);
}

export default function BackButton({ className }: { className?: string }) {
  const router = useRouter();

  const base =
    "inline-flex items-center gap-1.5 h-11 sm:h-8 px-3 rounded-[var(--th-radius-sm)] text-sm text-[var(--th-muted)] hover:text-[var(--th-fg)] hover:bg-[var(--th-muted-bg)] transition-colors border border-[var(--th-border)]";

  return (
    <button
      type="button"
      onClick={() => goBack(router)}
      aria-label="חזרה לדף הקודם"
      className={className ? `${base} ${className}` : base}
    >
      <span aria-hidden="true">&#8594;</span>
      חזרה
    </button>
  );
}
