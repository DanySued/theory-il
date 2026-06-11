import Skeleton from "@/components/Skeleton";

export default function Loading() {
  return (
    <main
      className="flex flex-1 flex-col items-center px-4 py-8 gap-6"
      aria-busy="true"
      aria-live="polite"
    >
      <div className="w-full max-w-6xl flex items-center justify-between gap-3">
        <Skeleton className="h-8 w-20" />
        <Skeleton className="h-9 w-36 rounded-full" />
      </div>
      <div className="w-full max-w-2xl flex items-center justify-between gap-3">
        <Skeleton className="h-2 flex-1 rounded-full" />
        <Skeleton className="h-7 w-28 rounded-full" />
      </div>
      <Skeleton className="w-full max-w-2xl h-96 rounded-[var(--th-radius)]" />
    </main>
  );
}
