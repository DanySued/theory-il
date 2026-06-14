import Skeleton from "@/components/Skeleton";
import PageShell from "@/components/PageShell";

export default function Loading() {
  return (
    <PageShell>
      <div
        className="w-full flex flex-col items-center gap-6"
        aria-busy="true"
        aria-live="polite"
      >
        <div className="w-full flex items-center justify-between gap-3">
          <Skeleton className="h-2 flex-1 rounded-full" />
          <Skeleton className="h-7 w-24 rounded-full" />
        </div>
        <Skeleton className="w-full h-72 rounded-[var(--th-radius-lg)]" />
        <div className="flex gap-3">
          <Skeleton className="h-11 w-28 rounded-[var(--th-radius-lg)]" />
          <Skeleton className="h-11 w-28 rounded-[var(--th-radius-lg)]" />
          <Skeleton className="h-11 w-28 rounded-[var(--th-radius-lg)]" />
        </div>
      </div>
    </PageShell>
  );
}
