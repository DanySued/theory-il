import Skeleton from "@/components/Skeleton";
import PageShell from "@/components/PageShell";

export default function Loading() {
  return (
    <PageShell>
      <div className="w-full flex flex-col gap-3" aria-busy="true" aria-live="polite">
        <Skeleton className="h-3 w-28" />
        <Skeleton className="h-10 w-64 max-w-full" />
        <Skeleton className="h-5 w-full max-w-md" />
      </div>
      <Skeleton className="h-11 w-full rounded-[var(--th-radius-lg)]" />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="h-24 rounded-[var(--th-radius-lg)]" />
        ))}
      </div>
    </PageShell>
  );
}
