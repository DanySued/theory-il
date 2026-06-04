"use client";

import { useEffect } from "react";
import type { Question } from "@/components/QuestionCard";
import BackButton from "@/components/BackButton";

const LABELS = ["א", "ב", "ג", "ד"];

interface PrintViewProps {
  topic: string;
  questions: Question[];
  showAnswers: boolean;
}

export default function PrintView({ topic, questions, showAnswers }: PrintViewProps) {
  useEffect(() => {
    const t = setTimeout(() => window.print(), 600);
    return () => clearTimeout(t);
  }, []);

  return (
    <>
      <div className="print:hidden w-full px-4 pt-3 flex justify-start">
        <BackButton />
      </div>
      <style>{`
        @media screen {
          body { background: #f5f5f5; }
          .print-wrap { max-width: 800px; margin: 0 auto; padding: 2rem; background: white; }
        }
        @media print {
          .no-print { display: none !important; }
          body { background: white; font-family: Arial, sans-serif; }
          .question { break-inside: avoid; }
        }
        .print-wrap { direction: rtl; font-family: Arial, sans-serif; font-size: 14px; line-height: 1.7; }
        h1 { font-size: 22px; margin-bottom: 4px; }
        .subtitle { color: #666; font-size: 12px; margin-bottom: 24px; }
        .question { margin-bottom: 18px; padding-bottom: 14px; border-bottom: 1px solid #e5e5e5; }
        .q-text { font-weight: bold; margin-bottom: 6px; }
        .answer { padding: 2px 0; color: #333; }
        .answer.correct { font-weight: bold; color: #16a34a; }
        .attribution { margin-top: 40px; font-size: 11px; color: #999; font-style: italic; text-align: right; }
      `}</style>

      <div className="print-wrap">
        {/* Screen-only controls */}
        <div className="no-print" style={{ marginBottom: "1.5rem", display: "flex", gap: "8px", justifyContent: "flex-end" }}>
          <button
            onClick={() => window.print()}
            style={{
              padding: "8px 16px",
              background: "#2563eb",
              color: "white",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              fontSize: "13px",
              fontFamily: "Arial",
            }}
          >
            🖨 הדפס / שמור PDF
          </button>
          <button
            onClick={() => window.close()}
            style={{
              padding: "8px 16px",
              background: "transparent",
              border: "1px solid #ddd",
              borderRadius: "8px",
              cursor: "pointer",
              fontSize: "13px",
              fontFamily: "Arial",
            }}
          >
            סגור
          </button>
        </div>

        {/* Document header */}
        <h1>{topic}</h1>
        <p className="subtitle">
          {questions.length} שאלות ·{" "}
          {showAnswers ? "כולל תשובות נכונות (מסומנות בירוק)" : "ללא תשובות — לתרגול עצמי"}
        </p>

        {/* Questions */}
        {questions.map((q, i) => (
          <div key={q.id} className="question">
            <div className="q-text">
              {i + 1}. {q.text}
            </div>
            <div>
              {q.answers.map((ans, idx) => {
                const isCorrect = showAnswers && idx === q.correctIndex;
                return (
                  <div key={idx} className={`answer${isCorrect ? " correct" : ""}`}>
                    {LABELS[idx]}. {ans}
                    {isCorrect && "  ✓"}
                  </div>
                );
              })}
            </div>
          </div>
        ))}

        {/* Attribution */}
        <div className="attribution">
          שאלות: משרד התחבורה והבטיחות בדרכים, data.gov.il, רישיון CC-BY
        </div>
      </div>
    </>
  );
}
