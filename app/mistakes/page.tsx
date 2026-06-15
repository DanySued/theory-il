import type { Metadata } from "next";
import MistakesClient from "./MistakesClient";

export const metadata: Metadata = {
  title: "הטעויות שלי — תיאוריה",
};

export default function MistakesPage() {
  return <MistakesClient />;
}
