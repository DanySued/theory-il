import type { Metadata } from "next";
import { Suspense } from "react";
import ReviewHub from "./ReviewHub";

export const metadata: Metadata = {
  title: "חזרה — תיאוריה",
};

export default function ReviewPage() {
  return (
    <Suspense fallback={null}>
      <ReviewHub />
    </Suspense>
  );
}
