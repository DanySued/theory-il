import type { Question } from "@/components/QuestionCard";

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
