import type { Question } from "@/components/QuestionCard";
import type { TrafficSign, SignCategory } from "@/lib/data/signs";

const LABELS = ["א", "ב", "ג", "ד"];

export async function generateDocx(
  topic: string,
  questions: Question[],
  showAnswers: boolean
): Promise<void> {
  const { Document, Packer, Paragraph, TextRun, AlignmentType } = await import("docx");

  const children = [];

  // Title
  children.push(
    new Paragraph({
      children: [new TextRun({ text: topic, bold: true, size: 36, font: "Arial" })],
      alignment: AlignmentType.RIGHT,
      bidirectional: true,
      spacing: { after: 200 },
    })
  );

  // Subtitle
  children.push(
    new Paragraph({
      children: [
        new TextRun({
          text: `${questions.length} שאלות · ${showAnswers ? "כולל תשובות נכונות" : "ללא תשובות — לתרגול"}`,
          size: 20,
          font: "Arial",
          color: "666666",
        }),
      ],
      alignment: AlignmentType.RIGHT,
      bidirectional: true,
      spacing: { after: 400 },
    })
  );

  for (let i = 0; i < questions.length; i++) {
    const q = questions[i];

    // Question text
    children.push(
      new Paragraph({
        children: [
          new TextRun({ text: `${i + 1}. ${q.text}`, bold: true, size: 22, font: "Arial" }),
        ],
        alignment: AlignmentType.RIGHT,
        bidirectional: true,
        spacing: { before: 200, after: 80 },
        keepNext: true,
      })
    );

    // Answers
    for (let j = 0; j < 4; j++) {
      const isCorrect = showAnswers && j === q.correctIndex;
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: `${LABELS[j]}. ${q.answers[j]}${isCorrect ? "  ✓" : ""}`,
              bold: isCorrect,
              color: isCorrect ? "16a34a" : "333333",
              size: 20,
              font: "Arial",
            }),
          ],
          alignment: AlignmentType.RIGHT,
          bidirectional: true,
          spacing: { after: 40 },
          ...(j < 3 ? { keepNext: true } : {}),
        })
      );
    }
  }

  // Attribution
  children.push(
    new Paragraph({
      children: [
        new TextRun({
          text: "שאלות: משרד התחבורה והבטיחות בדרכים, data.gov.il, רישיון CC-BY",
          size: 16,
          font: "Arial",
          color: "999999",
          italics: true,
        }),
      ],
      alignment: AlignmentType.RIGHT,
      bidirectional: true,
      spacing: { before: 600 },
    })
  );

  const doc = new Document({
    sections: [{ children }],
  });

  const blob = await Packer.toBlob(doc);
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${topic} — ${showAnswers ? "עם תשובות" : "ללא תשובות"}.docx`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export async function exportSignsToDocx(signs: TrafficSign[]): Promise<void> {
  const { Document, Packer, Paragraph, TextRun, AlignmentType } = await import("docx");

  const CATEGORY_ORDER: SignCategory[] = [
    "אזהרה",
    "חובה",
    "איסור",
    "מידע",
    "סימוני כביש",
  ];

  const children: any[] = [];

  // Title
  children.push(
    new Paragraph({
      children: [new TextRun({ text: "מילון התמרורים", bold: true, size: 36, font: "Arial" })],
      alignment: AlignmentType.RIGHT,
      bidirectional: true,
      spacing: { after: 200 },
    })
  );

  // Subtitle
  children.push(
    new Paragraph({
      children: [
        new TextRun({
          text: `${signs.length} תמרורים מסווגים`,
          size: 20,
          font: "Arial",
          color: "666666",
        }),
      ],
      alignment: AlignmentType.RIGHT,
      bidirectional: true,
      spacing: { after: 400 },
    })
  );

  // Group signs by category
  for (const category of CATEGORY_ORDER) {
    const groupSigns = signs.filter((s) => s.category === category);
    if (groupSigns.length === 0) continue;

    // Category heading
    children.push(
      new Paragraph({
        children: [
          new TextRun({
            text: `${category} (${groupSigns.length})`,
            bold: true,
            size: 26,
            font: "Arial",
          }),
        ],
        alignment: AlignmentType.RIGHT,
        bidirectional: true,
        spacing: { before: 300, after: 200 },
        keepNext: true,
      })
    );

    // Signs in category
    for (let i = 0; i < groupSigns.length; i++) {
      const sign = groupSigns[i];

      // Sign name
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: `${i + 1}. ${sign.name}`,
              bold: true,
              size: 22,
              font: "Arial",
            }),
          ],
          alignment: AlignmentType.RIGHT,
          bidirectional: true,
          spacing: { before: 150, after: 80 },
          keepNext: true,
        })
      );

      // Sign behavior
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: sign.behavior,
              size: 20,
              font: "Arial",
              color: "333333",
            }),
          ],
          alignment: AlignmentType.RIGHT,
          bidirectional: true,
          spacing: { after: 180 },
          ...(i < groupSigns.length - 1 ? { keepNext: true } : {}),
        })
      );
    }
  }

  // Attribution
  children.push(
    new Paragraph({
      children: [
        new TextRun({
          text: "תמרורים: משרד התחבורה והבטיחות בדרכים",
          size: 16,
          font: "Arial",
          color: "999999",
          italics: true,
        }),
      ],
      alignment: AlignmentType.RIGHT,
      bidirectional: true,
      spacing: { before: 600 },
    })
  );

  const doc = new Document({
    sections: [{ children }],
  });

  const blob = await Packer.toBlob(doc);
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "מילון-התמרורים.docx";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
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
