"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import type { TopicGuide } from "@/lib/data/guides";
import type { Question } from "@/components/QuestionCard";

const LABELS = ["א", "ב", "ג", "ד"] as const;
const RELATED_PER_SECTION = 3;

function findRelated(keywords: string[], questions: Question[]): Question[] {
  const lower = keywords.map((k) => k.toLowerCase());
  const scored = questions.map((q) => {
    const text = q.text.toLowerCase() + " " + q.answers.join(" ").toLowerCase();
    const score = lower.reduce((acc, kw) => acc + (text.includes(kw) ? 1 : 0), 0);
    return { q, score };
  });
  return scored
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, RELATED_PER_SECTION)
    .map((x) => x.q);
}

function RelatedQuestion({ question }: { question: Question }) {
  const [revealed, setRevealed] = useState(false);
  const [selected, setSelected] = useState<number | null>(null);

  function pick(idx: number) {
    if (revealed) return;
    setSelected(idx);
    setRevealed(true);
  }

  function buttonClass(idx: number) {
    const base = "w-full text-start px-3 py-2 rounded-lg border text-xs font-medium transition-colors ";
    if (!revealed) return base + "bg-[var(--th-card)] border-[var(--th-border)] hover:border-[var(--th-accent)] hover:bg-[var(--th-muted-bg)] cursor-pointer";
    if (idx === question.correctIndex) return base + "bg-[var(--th-success-soft)] border-[var(--th-success)] text-[var(--th-success)] cursor-default";
    if (idx === selected) return base + "bg-[var(--th-error-soft)] border-[var(--th-error)] text-[var(--th-error)] cursor-default";
    return base + "bg-[var(--th-card)] border-[var(--th-border)] opacity-50 cursor-default";
  }

  return (
    <div className="rounded-xl border border-[var(--th-border)] bg-[var(--th-muted-bg)] p-3 flex flex-col gap-2">
      <p className="text-xs font-semibold leading-snug">{question.text}</p>
      {question.image && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={question.image} alt={question.text} className="max-h-24 object-contain rounded" />
      )}
      <div className="flex flex-col gap-1">
        {question.answers.map((ans, idx) => (
          <button key={idx} className={buttonClass(idx)} onClick={() => pick(idx)}>
            <span className="font-bold me-1 text-[var(--th-accent)]">{LABELS[idx]}.</span>
            {ans}
            {revealed && idx === question.correctIndex && " ✓"}
          </button>
        ))}
      </div>
      {!revealed && (
        <button
          onClick={() => setRevealed(true)}
          className="self-start text-[10px] text-[var(--th-muted)] underline underline-offset-2 hover:text-[var(--th-fg)] transition-colors"
        >
          הצג תשובה
        </button>
      )}
    </div>
  );
}

function Section({
  section,
  questions,
  defaultOpen,
}: {
  section: TopicGuide["sections"][number];
  questions: Question[];
  defaultOpen: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const [showQ, setShowQ] = useState(false);
  const related = findRelated(section.keywords, questions);

  return (
    <div className="rounded-[var(--th-radius)] border border-[var(--th-border)] bg-[var(--th-card)] overflow-hidden">
      {/* Section header */}
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-[var(--th-muted-bg)] transition-colors"
      >
        <span className="font-bold text-lg">{section.title}</span>
        <span className={`text-[var(--th-muted)] transition-transform duration-200 ${open ? "rotate-180" : ""}`}>
          <ChevronDown size={16} strokeWidth={2} />
        </span>
      </button>

      {open && (
        <div className="px-5 pt-5 pb-6 flex flex-col gap-4 border-t border-[var(--th-border)]">
          {/* Body */}
          <p className="text-sm leading-relaxed">{section.body}</p>

          {/* Bullet points */}
          {section.points && (
            <ul className="flex flex-col gap-1.5">
              {section.points.map((pt, i) => (
                <li key={i} className="flex gap-2 text-sm">
                  <span className="text-[var(--th-accent)] mt-0.5 shrink-0">•</span>
                  <span>{pt}</span>
                </li>
              ))}
            </ul>
          )}

          {/* Related questions */}
          {related.length > 0 && (
            <div className="flex flex-col gap-2 pt-1">
              <button
                onClick={() => setShowQ((s) => !s)}
                className="self-start flex items-center gap-1 text-xs font-semibold text-[var(--th-accent)] hover:underline transition-colors"
              >
                <span className={`transition-transform duration-200 ${showQ ? "rotate-180" : ""}`}>
                <ChevronDown size={13} strokeWidth={2} />
              </span>
              שאלות קשורות ({related.length})
              </button>
              {showQ && (
                <div className="flex flex-col gap-2">
                  {related.map((q) => (
                    <RelatedQuestion key={q.id} question={q} />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function StudyGuide({
  guide,
  questions,
}: {
  guide: TopicGuide;
  questions: Question[];
}) {
  return (
    <div className="flex flex-col gap-4 w-full max-w-2xl">
      {/* Intro */}
      <p className="text-sm leading-relaxed text-[var(--th-muted)]">{guide.intro}</p>

      {/* Sections */}
      {guide.sections.map((section, i) => (
        <Section
          key={section.title}
          section={section}
          questions={questions}
          defaultOpen={i === 0}
        />
      ))}
    </div>
  );
}
