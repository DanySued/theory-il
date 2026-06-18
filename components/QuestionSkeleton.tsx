import Skeleton from "@/components/Skeleton";

/**
 * Structured placeholder that mirrors the question-card pages
 * (saved, mistakes, review, daily): a heading block, a progress bar,
 * then the question card itself with four answer rows.
 */
export default function QuestionSkeleton() {
  return (
    <div className="w-full flex flex-col gap-6" aria-busy="true" aria-live="polite">
      <div className="w-full flex flex-col gap-3">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-9 w-64 max-w-full" />
        <Skeleton className="h-5 w-full max-w-md" />
      </div>
      <Skeleton className="h-2 w-full rounded-full" />
      <div className="w-full flex flex-col gap-4 p-5 rounded-[var(--th-radius-lg)] bg-[var(--th-card)] border border-[var(--th-border)]">
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-6 w-1/2" />
        <div className="flex flex-col gap-3 mt-2">
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-12 rounded-[var(--th-radius)]" />
          ))}
        </div>
      </div>
    </div>
  );
}
