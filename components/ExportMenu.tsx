"use client";

import { useState } from "react";
import type { Question } from "@/components/QuestionCard";

interface ExportMenuProps {
  topic: string;
  questions: Question[];
}

type ExportKey = "pdf-yes" | "pdf-no" | "docx-yes" | "docx-no";

export default function ExportMenu({ topic, questions }: ExportMenuProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState<ExportKey | null>(null);

  async function handleDocx(showAnswers: boolean) {
    const key: ExportKey = showAnswers ? "docx-yes" : "docx-no";
    setLoading(key);
    try {
      const { generateDocx } = await import("@/lib/export");
      await generateDocx(topic, questions, showAnswers);
    } finally {
      setLoading(null);
    }
  }

  function openPrint(showAnswers: boolean) {
    window.open(
      `/study/${encodeURIComponent(topic)}/print?answers=${showAnswers ? "1" : "0"}`,
      "_blank"
    );
  }

  const btn =
    "flex items-center justify-center gap-1.5 px-3 py-2 rounded-[var(--th-radius)] border text-xs font-medium transition-colors disabled:opacity-50";
  const primary = `${btn} border-[var(--th-border)] hover:bg-[var(--th-muted-bg)]`;

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className={`${btn} border-[var(--th-border)] hover:bg-[var(--th-muted-bg)]`}
        aria-expanded={open}
      >
        ייצוא
        <span className="text-[10px]">{open ? "▲" : "▼"}</span>
      </button>

      {open && (
        <div className="absolute start-0 top-full mt-2 z-20 bg-[var(--th-card)] border border-[var(--th-border)] rounded-[var(--th-radius)] shadow-md p-3 flex flex-col gap-2 min-w-[220px]">
          <p className="text-xs text-[var(--th-muted)] mb-1">
            {questions.length} שאלות — {topic}
          </p>

          {/* With answers */}
          <p className="text-[11px] font-semibold text-[var(--th-fg)] mt-1">עם תשובות נכונות</p>
          <div className="flex gap-2">
            <button
              className={`${primary} flex-1`}
              onClick={() => openPrint(true)}
              title="פתח תצוגת הדפסה בלשונית חדשה"
            >
              🖨 PDF
            </button>
            <button
              className={`${primary} flex-1`}
              disabled={loading === "docx-yes"}
              onClick={() => handleDocx(true)}
            >
              {loading === "docx-yes" ? "..." : "📄 DOCX"}
            </button>
          </div>

          {/* Without answers */}
          <p className="text-[11px] font-semibold text-[var(--th-fg)] mt-1">ללא תשובות (לתרגול)</p>
          <div className="flex gap-2">
            <button
              className={`${primary} flex-1`}
              onClick={() => openPrint(false)}
              title="פתח תצוגת הדפסה בלשונית חדשה"
            >
              🖨 PDF
            </button>
            <button
              className={`${primary} flex-1`}
              disabled={loading === "docx-no"}
              onClick={() => handleDocx(false)}
            >
              {loading === "docx-no" ? "..." : "📄 DOCX"}
            </button>
          </div>
        </div>
      )}

      {/* Click-outside overlay */}
      {open && (
        <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
      )}
    </div>
  );
}
