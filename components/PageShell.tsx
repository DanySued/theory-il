import type { ReactNode } from "react";
import BackButton from "@/components/BackButton";

interface Props {
  children: ReactNode;
  showBack?: boolean;
  /** Tab-root pages drop the back button on phones: the bottom tab bar covers it. */
  mobileBack?: boolean;
  wide?: boolean;
}

export default function PageShell({
  children,
  showBack = true,
  mobileBack = true,
  wide = false,
}: Props) {
  const widthVar = wide ? "var(--th-container-wide)" : "var(--th-container)";

  return (
    <main
      className="th-page flex flex-1 flex-col items-center"
      style={{
        paddingInline: "var(--th-page-px)",
        rowGap: "var(--th-page-gap)",
      }}
    >
      {showBack && (
        <div
          className={`th-page-back w-full justify-start ${mobileBack ? "flex" : "hidden sm:flex"}`}
          style={{ maxWidth: widthVar }}
        >
          <BackButton />
        </div>
      )}
      <div
        className="w-full flex flex-col min-w-0"
        style={{ maxWidth: widthVar, rowGap: "var(--th-page-gap)" }}
      >
        {children}
      </div>
    </main>
  );
}
