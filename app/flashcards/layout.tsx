import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "כרטיסיות — תיאוריה",
};

export default function FlashcardsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
