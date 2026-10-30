"use client";

import { useEffect, useId, useRef } from "react";

interface Props {
  title: string;
  children: React.ReactNode;
  cancelLabel: string;
  confirmLabel: string;
  tone?: "accent" | "danger";
  onCancel: () => void;
  onConfirm: () => void;
}

/** Modal confirm: focuses the safe (cancel) action, traps Tab, Escape cancels, restores focus. */
export default function ConfirmDialog({
  title,
  children,
  cancelLabel,
  confirmLabel,
  tone = "accent",
  onCancel,
  onConfirm,
}: Props) {
  const titleId = useId();
  const panelRef = useRef<HTMLDivElement>(null);
  const cancelRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const previouslyFocused = document.activeElement as HTMLElement | null;
    cancelRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onCancel();
        return;
      }
      if (e.key !== "Tab") return;
      const focusable = panelRef.current?.querySelectorAll<HTMLElement>("button:not([disabled])");
      if (!focusable || focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      previouslyFocused?.focus?.();
    };
  }, [onCancel]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
      onClick={(e) => e.target === e.currentTarget && onCancel()}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="bg-[var(--th-card)] rounded-[var(--th-radius-lg)] border border-[var(--th-border)] p-6 max-w-sm w-full flex flex-col gap-4"
      >
        <h2 id={titleId} className="text-xl font-bold">
          {title}
        </h2>
        <div className="text-[var(--th-muted)] text-sm">{children}</div>
        <div className="flex gap-3 justify-end">
          <button
            ref={cancelRef}
            type="button"
            onClick={onCancel}
            className="h-11 px-4 rounded-[var(--th-radius)] border border-[var(--th-border)] text-sm font-medium hover:bg-[var(--th-muted-bg)] transition-colors"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={`h-11 px-4 rounded-[var(--th-radius-lg)] text-sm font-semibold transition-colors ${
              tone === "danger"
                ? "bg-[var(--th-error)] text-[var(--th-on-error)] hover:opacity-90"
                : "bg-[var(--th-accent)] text-[var(--th-on-accent)] hover:bg-[var(--th-accent-hover)]"
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
