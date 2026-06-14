import type { Metadata } from "next";
import { notFound } from "next/navigation";
import questionsData from "@/lib/data/questions.json";
import type { Question } from "@/components/QuestionCard";
import QuestionDetailClient from "./QuestionDetailClient";

const allQuestions = questionsData as Question[];

export function generateStaticParams() {
  return allQuestions.map((q) => ({ id: q.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const decoded = decodeURIComponent(id);
  const q = allQuestions.find((x) => x.id === decoded);
  if (!q) return { title: "שאלה לא נמצאה — תיאוריה" };
  const snippet = q.text.length > 80 ? `${q.text.slice(0, 80)}…` : q.text;
  return {
    title: `${snippet} — תיאוריה`,
    description: q.text,
  };
}

export default async function QuestionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const decoded = decodeURIComponent(id);
  const question = allQuestions.find((q) => q.id === decoded);
  if (!question) notFound();
  return <QuestionDetailClient question={question} />;
}
