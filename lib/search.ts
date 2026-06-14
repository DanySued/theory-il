import type { Question } from "@/components/QuestionCard";

export interface SearchResult {
  question: Question;
  matchedField: "text" | "answer" | "explanation";
  score: number;
}

/** Strip Hebrew niqqud (vowel marks) so "מה" matches "מַה". */
function stripNiqqud(s: string): string {
  return s.replace(/[֑-ׇ]/g, "");
}

function normalize(s: string): string {
  return stripNiqqud(s).toLowerCase().trim();
}

/**
 * Lightweight substring search over the question corpus.
 * - Tokenizes query on whitespace.
 * - Every token must appear in the haystack (AND-match) to score.
 * - Score boosts when match is in question text, when matches are contiguous,
 *   and when match appears early in the field.
 */
export function searchQuestions(
  questions: Question[],
  rawQuery: string,
  limit = 8
): SearchResult[] {
  const query = normalize(rawQuery);
  if (query.length < 2) return [];
  const tokens = query.split(/\s+/).filter((t) => t.length > 0);
  if (tokens.length === 0) return [];

  const out: SearchResult[] = [];

  for (const q of questions) {
    const text = normalize(q.text);
    const answers = q.answers.map(normalize);
    const explanation = q.explanation ? normalize(q.explanation) : "";

    let score = 0;
    let matchedField: SearchResult["matchedField"] = "text";

    // Whole-query contiguous match: big boost
    if (text.includes(query)) {
      score += 10 - Math.min(8, text.indexOf(query) / 8);
    } else if (answers.some((a) => a.includes(query))) {
      score += 6;
      matchedField = "answer";
    } else if (explanation.includes(query)) {
      score += 4;
      matchedField = "explanation";
    } else {
      // Fall back to per-token AND in the full haystack
      const hay = `${text} ${answers.join(" ")} ${explanation}`;
      if (!tokens.every((t) => hay.includes(t))) continue;
      score += 2 + tokens.length * 0.5;
      if (answers.some((a) => tokens.some((t) => a.includes(t)))) matchedField = "answer";
      if (explanation && tokens.some((t) => explanation.includes(t))) matchedField = "explanation";
    }

    out.push({ question: q, matchedField, score });
  }

  out.sort((a, b) => b.score - a.score);
  return out.slice(0, limit);
}
