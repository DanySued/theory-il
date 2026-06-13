import Skeleton from "@/components/Skeleton";

export default function Loading() {
  return (
    <main
      className="flex flex-1 flex-col items-center px-6 py-8 gap-8"
      aria-busy="true"
      aria-live="polite"
    >
      <div className="w-full max-w-6xl flex justify-start">
        <Skeleton className="h-8 w-20" />
      </div>
      <div className="w-full max-w-6xl flex flex-col gap-3">
        <Skeleton className="h-3 w-28" />
        <Skeleton className="h-6 w-64 max-w-full" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-6xl">
        {[0, 1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-36 rounded-[var(--th-radius)]" />
        ))}
      </div>
    </main>
  );
}
