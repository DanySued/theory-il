import type { ReactNode } from "react";

/** Shared shape for bar buttons (height, radius, layout); add your own colors. */
export const focusBase =
  "h-[52px] rounded-[14px] inline-flex items-center justify-center gap-2 font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed";

/** Primary action: accent fill, takes the remaining width. */
export const focusPrimary = `${focusBase} flex-1 min-w-0 px-4 text-[17px] bg-[var(--th-accent)] text-[var(--th-on-accent)] active:bg-[var(--th-accent-hover)]`;
/** Secondary action: outlined. Add flex-1 to stretch it. */
export const focusSecondary = `${focusBase} px-4 text-base border border-[var(--th-border-strong)] bg-[var(--th-card)] text-[var(--th-fg)] active:bg-[var(--th-muted-bg)]`;
/** Square-ish icon button (prev / next). */
export const focusIcon = `${focusBase} w-14 shrink-0 border border-[var(--th-border-strong)] bg-[var(--th-card)] text-[var(--th-fg)] active:bg-[var(--th-muted-bg)]`;

/**
 * Phone-only bottom bar holding a focus screen's primary actions in the thumb zone.
 * `aboveTabBar` stacks it on top of the bottom tab bar (browse screens such as results).
 */
export default function FocusActionBar({
  children,
  aboveTabBar = false,
  className = "",
}: {
  children: ReactNode;
  aboveTabBar?: boolean;
  className?: string;
}) {
  return (
    <div
      className={`th-actionbar sm:hidden fixed inset-x-0 z-40 px-4 pt-2.5 border-t border-[var(--th-border)] bg-[var(--th-card)]/95 backdrop-blur-md ${className}`}
      style={
        aboveTabBar
          ? { bottom: "calc(var(--th-tabbar-h) + var(--th-safe-b))", paddingBottom: "10px" }
          : { bottom: 0, paddingBottom: "calc(10px + var(--th-safe-b))" }
      }
    >
      <div className="flex gap-2.5">{children}</div>
    </div>
  );
}
