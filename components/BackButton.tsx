"use client";

import { useRouter } from "next/navigation";

export default function BackButton({ className }: { className?: string }) {
  const router = useRouter();

  function handleClick() {
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
    } else {
      router.push("/");
    }
  }

  const base =
    "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm text-[var(--th-muted)] hover:text-[var(--th-fg)] hover:bg-[var(--th-muted-bg)] transition-colors border border-[var(--th-border)]";

  return (
    <button
      type="button"
      onClick={handleClick}
      className={className ? `${base} ${className}` : base}
    >
      <span aria-hidden="true">&#8594;</span>
      חזרה
    </button>
  );
}
