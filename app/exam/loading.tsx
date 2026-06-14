import Skeleton from "@/components/Skeleton";
import PageShell from "@/components/PageShell";

export default function Loading() {
  return (
    <PageShell>
      <div
        className="w-full flex flex-col gap-8"
        aria-busy="true"
        aria-live="polite"
      >
        <div className="flex flex-col gap-3">
          <Skeleton className="h-3 w-48" />
          <Skeleton className="h-10 w-48" />
        </div>
        <div className="flex flex-col gap-3">
          <Skeleton className="h-3 w-12" />
          <div className="flex flex-wrap gap-2">
            {[0, 1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-9 w-24 rounded-full" />
            ))}
          </div>
        </div>
        <Skeleton className="h-14 w-full rounded-[var(--th-radius-lg)]" />
      </div>
    </PageShell>
  );
}
