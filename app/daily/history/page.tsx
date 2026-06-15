import type { Metadata } from "next";
import HistoryClient from "./HistoryClient";

export const metadata: Metadata = {
  title: "אתגר יומי · היסטוריה — תיאוריה",
};

export default function DailyHistoryPage() {
  return <HistoryClient />;
}
