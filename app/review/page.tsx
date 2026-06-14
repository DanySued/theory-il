import type { Metadata } from "next";
import ReviewClient from "./ReviewClient";

export const metadata: Metadata = {
  title: "חזרה חכמה — תיאוריה",
};

export default function ReviewPage() {
  return <ReviewClient />;
}
