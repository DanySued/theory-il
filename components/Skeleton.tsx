export default function Skeleton({
  className = "",
}: {
  className?: string;
}) {
  return (
    <div
      aria-hidden="true"
      className={`animate-pulse rounded-md bg-[var(--th-muted-bg)] ${className}`}
    />
  );
}
