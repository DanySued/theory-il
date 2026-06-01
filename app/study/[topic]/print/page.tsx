import { notFound } from "next/navigation";
import questionsData from "@/lib/data/questions.json";
import { type Question } from "@/components/QuestionCard";
import PrintView from "./PrintView";

const TOPIC_KEYS = ["חוקי התנועה", "תמרורים", "בטיחות", "הכרת הרכב"] as const;

export default async function PrintPage({
  params,
  searchParams,
}: {
  params: Promise<{ topic: string }>;
  searchParams: Promise<{ answers?: string }>;
}) {
  const { topic } = await params;
  const { answers } = await searchParams;

  const decoded = decodeURIComponent(topic);
  if (!TOPIC_KEYS.includes(decoded as (typeof TOPIC_KEYS)[number])) {
    notFound();
  }

  const showAnswers = answers !== "0";
  const questions = (questionsData as Question[]).filter((q) => q.topic === decoded);

  return <PrintView topic={decoded} questions={questions} showAnswers={showAnswers} />;
}
