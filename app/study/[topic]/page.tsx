import type { Metadata } from "next";
import { notFound } from "next/navigation";
import questionsData from "@/lib/data/questions.json";
import { type Question } from "@/components/QuestionCard";
import DrillClient from "./DrillClient";

const TOPIC_KEYS = ["חוקי התנועה", "תמרורים", "בטיחות", "הכרת הרכב"] as const;

const allQuestions = questionsData as Question[];

export function generateStaticParams() {
  return TOPIC_KEYS.map((topic) => ({
    topic: encodeURIComponent(topic),
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ topic: string }>;
}): Promise<Metadata> {
  const { topic } = await params;
  const decoded = decodeURIComponent(topic);
  return {
    title: `${decoded} — לימוד תיאוריה`,
  };
}

export default async function TopicPage({
  params,
}: {
  params: Promise<{ topic: string }>;
}) {
  const { topic } = await params;
  const decoded = decodeURIComponent(topic);

  if (!TOPIC_KEYS.includes(decoded as (typeof TOPIC_KEYS)[number])) {
    notFound();
  }

  const questions = allQuestions.filter((q) => q.topic === decoded);

  return <DrillClient topic={decoded} questions={questions} />;
}
