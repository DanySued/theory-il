"use client";

import { useExplanation } from "@/lib/explanations";

/** "Why?" block shown after an answer is revealed; renders nothing if there's no explanation. */
export default function Explanation({
  question,
  className = "",
}: {
  question: { id: string; explanation?: string };
  className?: string;
}) {
  const text = useExplanation(question, true);
  if (!text) return null;
  return (
    <div className={`text-sm leading-relaxed text-[var(--th-fg-soft)] ${className}`}>
      <span className="font-semibold text-[var(--th-fg)]">למה? </span>
      {text}
      <span className="block th-caption mt-1">הסבר לימודי של האתר — לא נוסח רשמי של משרד התחבורה.</span>
    </div>
  );
}
