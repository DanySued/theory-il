import type { ReactNode } from "react";

interface Props {
  eyebrow?: string;
  title: ReactNode;
  subtitle?: ReactNode;
  align?: "start" | "center";
}

export default function SectionHead({
  eyebrow,
  title,
  subtitle,
  align = "start",
}: Props) {
  const alignClass =
    align === "center" ? "items-center text-center" : "items-start text-start";

  return (
    <div className={`w-full flex flex-col gap-3 ${alignClass}`}>
      {eyebrow && <span className="th-eyebrow">{eyebrow}</span>}
      <h1 className="th-page-title">{title}</h1>
      {subtitle && (
        <p className="text-[var(--th-muted-strong)] text-base">{subtitle}</p>
      )}
    </div>
  );
}
