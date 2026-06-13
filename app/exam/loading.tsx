import Skeleton from "@/components/Skeleton";

export default function Loading() {
  return (
    <main
      className="flex flex-1 flex-col items-center justify-center px-4 py-8"
      aria-busy="true"
      aria-live="polite"
    >
      <div className="w-full max-w-lg flex flex-col gap-8">
        <div className="flex flex-col gap-3 items-center">
          <Skeleton className="h-3 w-48" />
          <Skeleton className="h-9 w-36" />
        </div>
        <Skeleton className="h-px w-full" />
        <div className="flex flex-col gap-3">
          <Skeleton className="h-3 w-12" />
          <div className="flex flex-wrap gap-2">
            {[0, 1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-9 w-24 rounded-full" />
            ))}
          </div>
        </div>
        <Skeleton className="h-14 w-full rounded-xl" />
      </div>
    </main>
  );
}
