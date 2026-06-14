import type { Metadata } from "next";
import ProgressClient from "./ProgressClient";

export const metadata: Metadata = {
  title: "התקדמות — תיאוריה",
};

export default function ProgressPage() {
  return <ProgressClient />;
}
