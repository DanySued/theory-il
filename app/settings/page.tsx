import type { Metadata } from "next";
import SettingsClient from "./SettingsClient";

export const metadata: Metadata = {
  title: "הגדרות — תיאוריה",
};

export default function SettingsPage() {
  return <SettingsClient />;
}
