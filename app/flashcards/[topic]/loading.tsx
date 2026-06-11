import Skeleton from "@/components/Skeleton";

export default function Loading() {
  return (
    <>
      <div className="w-full px-4 pt-3 flex justify-start">
        <Skeleton className="h-8 w-20" />
      </div>
      <main
        className="flex flex-1 flex-col items-center px-4 py-8 gap-6"
        aria-busy="true"
        aria-live="polite"
      >
        <div className="w-full max-w-2xl flex items-center justify-between gap-3">
          <Skeleton className="h-2 flex-1 rounded-full" />
          <Skeleton className="h-7 w-24 rounded-full" />
        </div>
        <Skeleton className="w-full max-w-2xl h-72 rounded-[var(--th-radius)]" />
        <div className="flex gap-3">
          <Skeleton className="h-11 w-28 rounded-[var(--th-radius)]" />
          <Skeleton className="h-11 w-28 rounded-[var(--th-radius)]" />
          <Skeleton className="h-11 w-28 rounded-[var(--th-radius)]" />
        </div>
      </main>
    </>
  );
}
