import type { Question } from "@/components/QuestionCard";
import type { TrafficSign } from "@/lib/data/signs";
import type { Attempt } from "@/lib/storage";
import type { Paragraph as TParagraph, TextRun as TTextRun, AlignmentType as TAlignmentType } from "docx";
import { LABELS, CATEGORY_ORDER } from "@/lib/constants";

type RunOpts = {
  text: string;
  bold?: boolean;
  size?: number;
  color?: string;
  italics?: boolean;
};

function makePHelper(
  Paragraph: typeof TParagraph,
  TextRun: typeof TTextRun,
  AlignmentType: typeof TAlignmentType
) {
  return (
    runs: RunOpts[],
    spacing?: { before?: number; after?: number },
    extra?: { keepNext?: boolean }
  ) =>
    new Paragraph({
      children: runs.map((r) => new TextRun({ font: "Arial", ...r })),
      alignment: AlignmentType.RIGHT,
      bidirectional: true,
      ...(spacing && { spacing }),
      ...extra,
    });
}

export async function generateDocx(
  topic: string,
  questions: Question[],
  showAnswers: boolean
): Promise<void> {
  const { Document, Packer, Paragraph, TextRun, AlignmentType } = await import("docx");
  const p = makePHelper(Paragraph, TextRun, AlignmentType);

  const children = [
    p([{ text: topic, bold: true, size: 36 }], { after: 200 }),
    p(
      [{ text: `${questions.length} שאלות · ${showAnswers ? "כולל תשובות נכונות" : "ללא תשובות — לתרגול"}`, size: 20, color: "666666" }],
      { after: 400 }
    ),
  ];

  for (let i = 0; i < questions.length; i++) {
    const q = questions[i];
    children.push(p([{ text: `${i + 1}. ${q.text}`, bold: true, size: 22 }], { before: 200, after: 80 }, { keepNext: true }));
    for (let j = 0; j < 4; j++) {
      const isCorrect = showAnswers && j === q.correctIndex;
      children.push(
        p(
          [{ text: `${LABELS[j]}. ${q.answers[j]}${isCorrect ? "  ✓" : ""}`, bold: isCorrect, color: isCorrect ? "16a34a" : "333333", size: 20 }],
          { after: 40 },
          j < 3 ? { keepNext: true } : undefined
        )
      );
    }
  }

  children.push(
    p(
      [{ text: "שאלות: משרד התחבורה והבטיחות בדרכים, data.gov.il, רישיון CC-BY", size: 16, color: "999999", italics: true }],
      { before: 600 }
    )
  );

  const doc = new Document({ sections: [{ children }] });
  const blob = await Packer.toBlob(doc);
  triggerDownload(blob, `${topic} — ${showAnswers ? "עם תשובות" : "ללא תשובות"}.docx`);
}

export async function exportSignsToDocx(signs: TrafficSign[]): Promise<void> {
  const { Document, Packer, Paragraph, TextRun, AlignmentType } = await import("docx");
  const p = makePHelper(Paragraph, TextRun, AlignmentType);

  const children = [
    p([{ text: "מילון התמרורים", bold: true, size: 36 }], { after: 200 }),
    p([{ text: `${signs.length} תמרורים מסווגים`, size: 20, color: "666666" }], { after: 400 }),
  ];

  for (const category of CATEGORY_ORDER) {
    const groupSigns = signs.filter((s) => s.category === category);
    if (groupSigns.length === 0) continue;
    children.push(p([{ text: `${category} (${groupSigns.length})`, bold: true, size: 26 }], { before: 300, after: 200 }, { keepNext: true }));
    for (let i = 0; i < groupSigns.length; i++) {
      const sign = groupSigns[i];
      children.push(p([{ text: `${i + 1}. ${sign.name}`, bold: true, size: 22 }], { before: 150, after: 80 }, { keepNext: true }));
      children.push(p([{ text: sign.behavior, size: 20, color: "333333" }], { after: 180 }, i < groupSigns.length - 1 ? { keepNext: true } : undefined));
    }
  }

  children.push(
    p([{ text: "תמרורים: משרד התחבורה והבטיחות בדרכים", size: 16, color: "999999", italics: true }], { before: 600 })
  );

  const doc = new Document({ sections: [{ children }] });
  const blob = await Packer.toBlob(doc);
  triggerDownload(blob, "מילון-התמרורים.docx");
}

export async function exportAttemptToDocx(attempt: Attempt): Promise<void> {
  const { Document, Packer, Paragraph, TextRun, AlignmentType } = await import("docx");
  const p = makePHelper(Paragraph, TextRun, AlignmentType);

  const total = attempt.questions.length;
  const correct = attempt.questions.filter((q, i) => attempt.answers[i] === q.correctIndex).length;
  const passed = total === 30 && correct >= 26;
  const dateStr = new Date(attempt.finishedAt).toLocaleDateString("he-IL");
  const scoreColor = passed ? "16a34a" : total === 30 ? "dc2626" : "333333";

  const children = [
    p([{ text: "תוצאות מבחן תיאוריה", bold: true, size: 36 }], { after: 200 }),
    p([{ text: `${correct}/${total} נכון`, bold: true, size: 26, color: scoreColor }], { after: 80 }),
  ];

  if (total === 30) {
    children.push(p([{ text: passed ? "עברת ✓" : "לא עברת ✗", bold: true, size: 22, color: scoreColor }], { after: 80 }));
  }

  children.push(p([{ text: `תאריך: ${dateStr}`, size: 18, color: "666666" }], { after: 400 }));

  for (let i = 0; i < attempt.questions.length; i++) {
    const q = attempt.questions[i];
    const userAnswer = attempt.answers[i];
    children.push(p([{ text: `${i + 1}. ${q.text}`, bold: true, size: 22 }], { before: 200, after: 80 }, { keepNext: true }));
    for (let j = 0; j < 4; j++) {
      const isCorrect = j === q.correctIndex;
      const isUser = j === userAnswer;
      const suffix = isCorrect ? "  ✓" : isUser ? "  ← תשובתך" : "";
      children.push(
        p(
          [{ text: `${LABELS[j]}. ${q.answers[j]}${suffix}`, bold: isCorrect || isUser, color: isCorrect ? "16a34a" : isUser ? "dc2626" : "333333", size: 20 }],
          { after: 40 },
          j < 3 ? { keepNext: true } : undefined
        )
      );
    }
  }

  children.push(
    p([{ text: "שאלות: משרד התחבורה והבטיחות בדרכים, data.gov.il, רישיון CC-BY", size: 16, color: "999999", italics: true }], { before: 600 })
  );

  const doc = new Document({ sections: [{ children }] });
  const blob = await Packer.toBlob(doc);
  triggerDownload(blob, `תוצאות-מבחן-${dateStr}.docx`);
}

export async function exportResultCard(element: HTMLElement): Promise<void> {
  const { toPng } = await import("html-to-image");
  const dataUrl = await toPng(element, { pixelRatio: 2 });

  if (typeof navigator !== "undefined" && navigator.share && navigator.canShare) {
    try {
      const res = await fetch(dataUrl);
      const blob = await res.blob();
      const file = new File([blob], "תיאוריה-תוצאה.png", { type: "image/png" });
      if (navigator.canShare({ files: [file] })) {
        await navigator.share({ files: [file], title: "תוצאת מבחן תיאוריה" });
        return;
      }
    } catch {
      // fall through to download
    }
  }

  const a = document.createElement("a");
  a.download = "תיאוריה-תוצאה.png";
  a.href = dataUrl;
  a.click();
}

function triggerDownload(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
