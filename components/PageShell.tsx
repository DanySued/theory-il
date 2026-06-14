import type { ReactNode } from "react";
import BackButton from "@/components/BackButton";

interface Props {
  children: ReactNode;
  showBack?: boolean;
  wide?: boolean;
}

export default function PageShell({
  children,
  showBack = true,
  wide = false,
}: Props) {
  const widthVar = wide ? "var(--th-container-wide)" : "var(--th-container)";

  return (
    <main
      className="flex flex-1 flex-col items-center"
      style={{
        paddingInline: "var(--th-page-px)",
        paddingBlock: "var(--th-page-py)",
        rowGap: "var(--th-page-gap)",
      }}
    >
      {showBack && (
        <div
          className="w-full flex justify-start"
          style={{ maxWidth: widthVar }}
        >
          <BackButton />
        </div>
      )}
      <div
        className="w-full flex flex-col"
        style={{ maxWidth: widthVar, rowGap: "var(--th-page-gap)" }}
      >
        {children}
      </div>
    </main>
  );
}
