import type { Metadata } from "next";
import SavedClient from "./SavedClient";

export const metadata: Metadata = {
  title: "שמורות — תיאוריה",
};

export default function SavedPage() {
  return <SavedClient />;
}
