import type { Metadata } from "next";
import { generateExam } from "@/lib/exam";
import ExamRunner from "@/components/ExamRunner";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "מבחן מדומה — תיאוריה",
};

export default function ExamPage() {
  const questions = generateExam();
  return <ExamRunner questions={questions} />;
}
