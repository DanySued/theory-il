import Skeleton from "@/components/Skeleton";
import PageShell from "@/components/PageShell";

export default function Loading() {
  return (
    <PageShell>
      <div
        className="w-full flex flex-col gap-3"
        aria-busy="true"
        aria-live="polite"
      >
        <Skeleton className="h-3 w-28" />
        <Skeleton className="h-10 w-72 max-w-full" />
        <Skeleton className="h-5 w-full max-w-md" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
        {[0, 1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-36 rounded-[var(--th-radius-lg)]" />
        ))}
      </div>
    </PageShell>
  );
}
