import Anthropic from "@anthropic-ai/sdk";
import { readFileSync, writeFileSync } from "fs";
import { fileURLToPath } from "url";
import path from "path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const QUESTIONS_PATH = path.join(__dirname, "../lib/data/questions.json");

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

async function generateExplanation(question) {
  const correctAnswer = question.answers[question.correctIndex];
  const prompt = `שאלה מבחן תיאוריה ישראלי:
"${question.text}"

תשובות אפשריות:
${question.answers.map((a, i) => `${i + 1}. ${a}`).join("\n")}

התשובה הנכונה: ${correctAnswer}

כתוב הסבר קצר בעברית פשוטה (משפט אחד עד שניים) המסביר מדוע "${correctAnswer}" היא התשובה הנכונה, בהתייחסות לחוק התנועה הרלוונטי, למשמעות התמרור, או לעיקרון הבטיחות. ללא הקדמה, רק ההסבר עצמו.`;

  const msg = await client.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 200,
    messages: [{ role: "user", content: prompt }],
  });

  return msg.content[0].text.trim();
}

async function main() {
  const questions = JSON.parse(readFileSync(QUESTIONS_PATH, "utf-8"));
  const total = questions.length;
  let processed = 0;

  for (let i = 0; i < total; i += 5) {
    const batch = questions.slice(i, i + 5);
    const needsWork = batch.filter((q) => !q.explanation);

    if (needsWork.length === 0) {
      processed += batch.length;
      continue;
    }

    await Promise.all(
      needsWork.map(async (q) => {
        try {
          q.explanation = await generateExplanation(q);
          processed++;
          process.stdout.write(`[${processed}/${total}] id=${q.id} done\n`);
        } catch (err) {
          processed++;
          process.stderr.write(`[${processed}/${total}] id=${q.id} ERROR: ${err.message}\n`);
        }
      })
    );

    // Count skipped (already had explanations) in batch
    const skippedInBatch = batch.length - needsWork.length;
    processed += skippedInBatch;

    // Write back after each batch
    writeFileSync(QUESTIONS_PATH, JSON.stringify(questions, null, 2), "utf-8");
  }

  console.log(`\nAll done. Processed ${total} questions.`);
}

main().catch((err) => {
  console.error("Fatal:", err);
  process.exit(1);
});
