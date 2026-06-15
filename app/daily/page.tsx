import type { Metadata } from "next";
import DailyClient from "./DailyClient";

export const metadata: Metadata = {
  title: "אתגר יומי — תיאוריה",
};

export default function DailyPage() {
  return <DailyClient />;
}
