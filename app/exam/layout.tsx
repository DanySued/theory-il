import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "מבחן מדומה — תיאוריה",
};

export default function ExamLayout({ children }: { children: React.ReactNode }) {
  return children;
}
