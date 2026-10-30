// Fills gaps in lib/data/explanations.json (question id → short Hebrew explanation).
// Existing entries are never overwritten, so hand-written explanations are safe.
// Usage: ANTHROPIC_API_KEY=... npm run generate:explanations
// Spot-check the output before committing — these are shown to learners.
import Anthropic from "@anthropic-ai/sdk";
import { readFileSync, writeFileSync } from "fs";
import { fileURLToPath } from "url";
import path from "path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const QUESTIONS_PATH = path.join(__dirname, "../lib/data/questions.json");
const EXPLANATIONS_PATH = path.join(__dirname, "../lib/data/explanations.json");
const MODEL = "claude-haiku-5-5";

const client = new Anthropic();

async function generateExplanation(question) {
  const correctAnswer = question.answers[question.correctIndex];
  const content = [];
  if (question.image) {
    content.push({ type: "image", source: { type: "url", url: question.image } });
  }
  content.push({
    type: "text",
    text: `שאלה מבחן תיאוריה ישראלי:
"${question.text}"

תשובות אפשריות:
${question.answers.map((a, i) => `${i + 1}. ${a}`).join("\n")}

התשובה הנכונה: ${correctAnswer}

כתוב הסבר קצר בעברית פשוטה (משפט אחד עד שניים) המסביר מדוע "${correctAnswer}" היא התשובה הנכונה, בהתייחסות לחוק התנועה הרלוונטי, למשמעות התמרור, או לעיקרון הבטיחות. אל תוסיף עובדות שאינך בטוח בהן. ללא הקדמה, רק ההסבר עצמו.`,
  });

  const msg = await client.messages.create({
    model: MODEL,
    max_tokens: 1024,
    output_config: { effort: "low" },
    messages: [{ role: "user", content }],
  });

  if (msg.stop_reason === "refusal") throw new Error("model declined");
  const text = msg.content.find((b) => b.type === "text")?.text?.trim();
  if (!text) throw new Error(`no text (stop_reason: ${msg.stop_reason})`);
  return text;
}

async function main() {
  const questions = JSON.parse(readFileSync(QUESTIONS_PATH, "utf-8"));
  const explanations = JSON.parse(readFileSync(EXPLANATIONS_PATH, "utf-8"));
  const todo = questions.filter((q) => !explanations[q.id]);
  console.log(`${todo.length} questions without an explanation.`);

  let done = 0;
  for (let i = 0; i < todo.length; i += 5) {
    const batch = todo.slice(i, i + 5);
    await Promise.all(
      batch.map(async (q) => {
        try {
          explanations[q.id] = await generateExplanation(q);
          console.log(`[${++done}/${todo.length}] ${q.id}`);
        } catch (err) {
          console.error(`[${++done}/${todo.length}] ${q.id} ERROR: ${err.message}`);
        }
      })
    );
    const sorted = Object.fromEntries(Object.entries(explanations).sort(([a], [b]) => a.localeCompare(b)));
    writeFileSync(EXPLANATIONS_PATH, JSON.stringify(sorted, null, 0), "utf-8");
  }
  console.log("Done.");
}

main().catch((err) => {
  console.error("Fatal:", err);
  process.exit(1);
});
