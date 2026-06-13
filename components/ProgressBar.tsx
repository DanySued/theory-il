"use client";


interface ProgressBarProps {
  current: number;
  total: number;
  className?: string;
}

export default function ProgressBar({ current, total, className = "" }: ProgressBarProps) {
  const pct = total > 0 ? Math.round((current / total) * 100) : 0;

  return (
    <div
      className={`w-full h-2 bg-[var(--th-muted-bg)] rounded-full overflow-hidden ${className}`}
      role="progressbar"
      aria-valuenow={current}
      aria-valuemin={0}
      aria-valuemax={total}
      aria-label={`${current} מתוך ${total}`}
    >
      <div
        className="relative h-full bg-[var(--th-accent)] rounded-full overflow-hidden"
        style={{ width: `${pct}%` }}
      >
        {/* shine bar — static, no animation */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(90deg, transparent, rgba(255,255,255,0.18), transparent)",
          }}
        />
      </div>
    </div>
  );
}
