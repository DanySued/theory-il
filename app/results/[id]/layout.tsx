import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "תוצאות מבחן — תיאוריה",
};

export default function ResultsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
