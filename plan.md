# theory-il — v2 Plan

**Repo:** `C:\Users\danys\MyGithubRepos\theory-il`  
**Deploy:** https://theory-il.vercel.app (auto-deploy on push to master)  
**Stack:** Next.js 16 App Router · React 19 · TypeScript · Tailwind v4 · shadcn/ui · Vercel

---

## Execution Order (priority)

| Order | Section | Why first |
|---|---|---|
| 1 | Learning features — weak tracking + streaks | Highest retention value; pure localStorage, no deps |
| 2 | UX & animation polish | Makes every other feature feel good; add Framer Motion once |
| 3 | Spaced repetition + flashcards | Builds on weak tracking data already collected |
| 4 | Result card image export | Isolated feature, short burst, satisfying |
| 5 | English i18n | Largest scope; do last so all other features can be translated too |

---

## 1. Learning Features — Streaks, Weak Areas, Progress

**Complexity: M**

### 1a. Per-question performance tracking

Extend `lib/storage.ts` with a new key namespace `theory-il:qstats:` that records per-question outcomes. This is the foundation for spaced repetition, weak-area detection, and topic progress.

**New type in `lib/storage.ts`:**

```ts
export type QuestionStats = {
  id: string;
  correct: number;   // times answered correctly
  wrong: number;     // times answered wrong
  seen: number;      // total times seen
  lastSeen: number;  // timestamp ms
};

const QSTATS_KEY = "theory-il:qstats";

export function getQStats(): Record<string, QuestionStats> {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(localStorage.getItem(QSTATS_KEY) ?? "{}");
  } catch { return {}; }
}

export function recordAnswer(questionId: string, wasCorrect: boolean): void {
  if (typeof window === "undefined") return;
  const stats = getQStats();
  const s = stats[questionId] ?? { id: questionId, correct: 0, wrong: 0, seen: 0, lastSeen: 0 };
  s.seen++;
  s.lastSeen = Date.now();
  if (wasCorrect) s.correct++; else s.wrong++;
  stats[questionId] = s;
  localStorage.setItem(QSTATS_KEY, JSON.stringify(stats));
}
```

Call `recordAnswer(q.id, isCorrect)` in two places:
- `components/QuestionCard.tsx` — inside `onAnswer` when the answer is revealed
- `app/results/[id]/page.tsx` — after loading the attempt, batch-record all answers (guard with a "recorded" flag in the attempt to avoid double-recording)

**Weak question score:** `wrongRate = wrong / seen`. Questions with `wrongRate > 0.5 && seen >= 2` are "weak". Surface at the top of each topic drill as a "focus" section.

### 1b. Topic progress bar — make it real

`components/TopicGrid.tsx` currently renders `width: "0%"`. Replace with a client wrapper that reads `getQStats()` on mount and computes `seen/total` per topic.

Create `components/TopicGridClient.tsx` (client component). It accepts the same `topics` prop plus the full `questions` list. On mount it reads `getQStats()` and derives:
- `seenCount` = questions in this topic where `stats[id]?.seen > 0`
- `correctRate` = correct / seen across topic questions
- Render two overlapping bars: grey background = `seenCount/total`, green foreground = `correctRate * seenCount/total`

In `app/study/page.tsx`, import `TopicGridClient` instead of `TopicGrid` and pass `questions` down.

### 1c. Daily streak

New key: `theory-il:streak` in localStorage.

```ts
export type StreakData = {
  current: number;    // consecutive days
  longest: number;
  lastStudyDate: string; // "YYYY-MM-DD"
};

export function updateStreak(): StreakData { ... }
export function getStreak(): StreakData { ... }
```

Logic: on each session start (study drill or exam), compare `lastStudyDate` to today:
- Same day → no change
- Yesterday → `current++`
- Older → `current = 1`

Display: add a `StreakBadge` component (🔥 N ימים רצופים) in the nav or on the home page. Animate the number with a CSS keyframe pop when it increases.

**New file: `components/StreakBadge.tsx`** (client, reads from localStorage on mount).

Show on `app/page.tsx` home hero — small pill below the CTA buttons.

### 1d. "Focus on weak questions" mode

In `app/study/[topic]/DrillClient.tsx`, add a toggle at the top: "שאלות קשות בלבד". When toggled, filter `questions` to only those where `wrongRate > 0.4 && seen >= 1`. If no weak questions yet, show an encouraging prompt to answer more first.

---

## 2. UX & Animation Polish

**Complexity: M**

### 2a. Add Framer Motion

```bash
npm install motion
```

(The package is now `motion` — the unified Motion library, previously `framer-motion`. Import from `motion/react`.)

### 2b. Question card slide transition

In `components/QuestionCard.tsx`, wrap the card div in an `<AnimatePresence>` + `<motion.div>` keyed on `currentIndex`. Use `x` axis slide — slide right when going back, slide left when going forward. Pass a `direction` prop from the parent.

```tsx
import { motion, AnimatePresence } from "motion/react";

<AnimatePresence mode="wait" custom={direction}>
  <motion.div
    key={currentIndex}
    custom={direction}
    variants={{
      enter: (d: number) => ({ x: d > 0 ? -60 : 60, opacity: 0 }),
      center: { x: 0, opacity: 1 },
      exit: (d: number) => ({ x: d > 0 ? 60 : -60, opacity: 0 }),
    }}
    initial="enter"
    animate="center"
    exit="exit"
    transition={{ duration: 0.2, ease: "easeInOut" }}
  >
    {/* card content */}
  </motion.div>
</AnimatePresence>
```

### 2c. Answer button feedback micro-animation

When an answer is selected, animate the button: scale up briefly then settle. For correct answers, use a green shimmer; for wrong, a red shake.

```tsx
<motion.button
  whileTap={{ scale: 0.97 }}
  animate={showAnswer && idx === question.correctIndex
    ? { scale: [1, 1.02, 1] }
    : showAnswer && idx === selectedAnswer
    ? { x: [0, -6, 6, -4, 4, 0] } // shake
    : {}}
  transition={{ duration: 0.3 }}
>
```

### 2d. Progress bar on exam top bar

`ExamRunner.tsx` already has a sticky top bar with timer and answered count. Add a thin animated progress bar directly below it:

```tsx
<motion.div
  className="h-1 bg-[var(--th-accent)]"
  animate={{ width: `${(answeredCount / questions.length) * 100}%` }}
  transition={{ duration: 0.4, ease: "easeOut" }}
/>
```

### 2e. Results page score counter animation

In `app/results/[id]/page.tsx`, instead of rendering `{correct}/30` statically, count up from 0 to `correct` over 800ms using a `useEffect` + `useState` counter with `requestAnimationFrame`. The number appearing one digit at a time is satisfying and emphasises the score.

### 2f. Mobile swipe gestures

Add touch swipe navigation to `QuestionCard.tsx` using Framer Motion's `drag` prop:

```tsx
<motion.div
  drag="x"
  dragConstraints={{ left: 0, right: 0 }}
  onDragEnd={(_, info) => {
    if (info.offset.x < -50) onNext();
    if (info.offset.x > 50) onPrev();
  }}
>
```

This makes the study drill genuinely mobile-first.

### 2g. Home page hero entrance animation

Wrap the home page hero content in `motion.div` with a stagger:

```tsx
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.5 }}
>
```

Stagger the heading, subtitle, and buttons with `delay: 0`, `0.1`, `0.2`.

---

## 3. Spaced Repetition + Flashcard Mode

**Complexity: L**

### 3a. SM-2 implementation

Install the `supermemo` package:

```bash
npm install supermemo
```

It exports a single function `supermemo(item, grade)` where `grade` is 0–5 (0–2 = wrong, 3–5 = correct degrees). It returns `{ interval, repetition, efactor }`.

**New file: `lib/srs.ts`**

```ts
import { supermemo, SuperMemoItem } from "supermemo";
import type { QuestionStats } from "./storage";

export type SRSCard = {
  id: string;
  interval: number;    // days until next review
  repetition: number;
  efactor: number;     // ease factor (default 2.5)
  dueDate: string;     // ISO date "YYYY-MM-DD"
};

const SRS_KEY = "theory-il:srs";

export function getSRSCards(): Record<string, SRSCard> { ... }

export function reviewCard(id: string, grade: number): SRSCard {
  const cards = getSRSCards();
  const card = cards[id] ?? { interval: 0, repetition: 0, efactor: 2.5 };
  const result = supermemo(card, grade);
  const due = new Date();
  due.setDate(due.getDate() + result.interval);
  const updated: SRSCard = {
    id,
    ...result,
    dueDate: due.toISOString().slice(0, 10),
  };
  cards[id] = updated;
  localStorage.setItem(SRS_KEY, JSON.stringify(cards));
  return updated;
}

export function getDueCards(allIds: string[]): string[] {
  const cards = getSRSCards();
  const today = new Date().toISOString().slice(0, 10);
  return allIds.filter((id) => {
    const c = cards[id];
    return !c || c.dueDate <= today; // unseen or due
  });
}
```

Grade mapping: correct on first try → 5, correct after hint → 3, wrong → 1.

### 3b. Flashcard UI mode

New route: `app/flashcards/page.tsx` — topic picker showing how many cards are due per topic.

New route: `app/flashcards/[topic]/page.tsx` — server component that passes questions and due card IDs to `FlashcardRunner`.

**New file: `components/FlashcardRunner.tsx`** (client).

The flashcard has two states: **front** (question text + image) and **back** (correct answer + explanation). Flip is a CSS 3D transform animated via Framer Motion:

```tsx
const [flipped, setFlipped] = useState(false);

<div className="relative h-64 cursor-pointer" style={{ perspective: 1200 }}>
  <motion.div
    className="w-full h-full relative"
    animate={{ rotateY: flipped ? 180 : 0 }}
    transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
    style={{ transformStyle: "preserve-3d" }}
    onClick={() => setFlipped((f) => !f)}
  >
    {/* Front */}
    <div className="absolute inset-0 backface-hidden rounded-[var(--th-radius)] border border-[var(--th-border)] bg-[var(--th-card)] p-6 flex flex-col justify-center">
      <p className="text-lg font-semibold leading-relaxed">{q.text}</p>
    </div>
    {/* Back */}
    <div
      className="absolute inset-0 backface-hidden rounded-[var(--th-radius)] border border-[var(--th-success)] bg-green-50 p-6 flex flex-col justify-center gap-3"
      style={{ transform: "rotateY(180deg)" }}
    >
      <p className="text-lg font-bold text-[var(--th-success)]">{q.answers[q.correctIndex]}</p>
      {q.explanation && <p className="text-sm text-[var(--th-muted)]">{q.explanation}</p>}
    </div>
  </motion.div>
</div>
```

Add `backface-hidden` as a Tailwind utility in `globals.css`:
```css
.backface-hidden { backface-visibility: hidden; }
```

After the flip, show three rating buttons: **ידעתי** (grade 5), **בערך** (grade 3), **לא ידעתי** (grade 1). Call `reviewCard(q.id, grade)` and advance to next card.

Show a completion screen when all due cards are reviewed, with the count of cards reviewed and next review date.

### 3c. Nav link

Add "כרטיסיות" link to the nav/header alongside Study and Exam. Since the app currently has no persistent nav bar (children are in `body`), this is a good time to create one.

**New file: `components/NavBar.tsx`** (client, for language toggle + links later).

Add `<NavBar />` to `app/layout.tsx` above `{children}`.

---

## 4. Result Card Image Export

**Complexity: S**

The `app/results/[id]/page.tsx` score banner already has the right structure. Add a share button that renders it to a PNG via `html-to-image`.

### 4a. Install

```bash
npm install html-to-image
```

### 4b. ShareCard component

**New file: `components/ShareCard.tsx`** — a fixed-size (600×340px) `div` that is rendered off-screen (or in a visually hidden portal) and used only as the image source. It must be self-contained with inline styles because `html-to-image` does not reliably capture Tailwind/CSS-variable styles.

Design: dark card with the site name top-left, big score centre, pass/fail label, topic breakdown small row at bottom, "theory-il.vercel.app" watermark.

```tsx
// This div is ref'd and turned into a PNG. All styles inline.
<div ref={cardRef} style={{
  width: 600, height: 340, background: "#1a1a1a",
  borderRadius: 16, padding: 40, display: "flex", flexDirection: "column",
  fontFamily: "Heebo, Arial, sans-serif", direction: "rtl",
  color: "#f0eeea",
}}>
  <div style={{ fontSize: 13, color: "#9ca3af" }}>תיאוריה — מבחן מדומה</div>
  <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 8 }}>
    <div style={{ fontSize: 80, fontWeight: 800, color: passed ? "#4ade80" : "#f87171" }}>{correct}/30</div>
    <div style={{ fontSize: 24, fontWeight: 700, color: passed ? "#4ade80" : "#f87171" }}>{passed ? "עברתי!" : "לא עברתי"}</div>
    <div style={{ fontSize: 13, color: "#6b7280" }}>זמן: {duration} · ציון מעבר: 26/30</div>
  </div>
  <div style={{ fontSize: 12, color: "#6b7280" }}>theory-il.vercel.app</div>
</div>
```

### 4c. Export function in `lib/export.ts`

Add alongside the existing `generateDocx`:

```ts
import { toPng } from "html-to-image";

export async function exportResultCard(ref: React.RefObject<HTMLDivElement>): Promise<void> {
  if (!ref.current) return;
  const dataUrl = await toPng(ref.current, { pixelRatio: 2 });
  const a = document.createElement("a");
  a.download = "תיאוריה-תוצאה.png";
  a.href = dataUrl;
  a.click();
}
```

### 4d. Web Share API fallback

After generating the PNG blob, try `navigator.share({ files: [pngFile] })` first (works on iOS Safari and Android Chrome). Fall back to download if `navigator.share` is unsupported or throws.

### 4e. Wire into results page

In `app/results/[id]/page.tsx`, add:
- A `ShareCard` rendered with `visibility: hidden; position: absolute; pointer-events: none` at the bottom of the page (so it's in the DOM but invisible)
- A "שתף תוצאות" button in the actions row — clicking it calls `exportResultCard`

Keep the existing "מבחן נוסף" and "חזרה ללמוד" buttons; add the share button as a third action, styled with an icon (a simple SVG share icon, no extra library needed).

---

## 5. English Translation for Immigrants

**Complexity: L**

### 5a. Strategy: no URL routing, localStorage toggle

Skip `next-intl`'s URL-based routing (`/en/`, `/he/`) — it requires restructuring every route and middleware. Instead:

- Store locale in localStorage: `theory-il:lang` = `"he"` | `"en"`
- Provide it via a React context that reads from localStorage on mount
- The HTML `lang` and `dir` attributes are updated dynamically on the client

This keeps the URL clean (no `/en` prefix), avoids server-side locale detection complexity, and respects the "no backend" constraint.

### 5b. Translation dictionary

**New file: `lib/i18n.ts`**

```ts
export type Locale = "he" | "en";

export const UI: Record<string, Record<Locale, string>> = {
  "home.title":          { he: "מתכוננים לתיאוריה?", en: "Preparing for the Theory Test?" },
  "home.subtitle":       { he: "לומדים עם שאלות מהמאגר הרשמי...", en: "Study with official questions from the Israeli Ministry of Transport..." },
  "nav.study":           { he: "לימוד", en: "Study" },
  "nav.exam":            { he: "מבחן", en: "Exam" },
  "nav.flashcards":      { he: "כרטיסיות", en: "Flashcards" },
  "study.title":         { he: "לימוד לפי נושאים", en: "Study by Topic" },
  "exam.submit":         { he: "סיים מבחן", en: "Submit Exam" },
  "results.pass":        { he: "עברת! ✓", en: "Passed! ✓" },
  "results.fail":        { he: "לא עברת ✗", en: "Failed ✗" },
  // ... extend as needed
};

export function t(key: string, locale: Locale): string {
  return UI[key]?.[locale] ?? UI[key]?.["he"] ?? key;
}
```

### 5c. Question translations

The 1,273 questions need English text. Options in order of effort:

1. **Automated first pass:** Run a script (`scripts/translate-questions.ts`) that calls Google Translate or DeepL API over the questions.json and produces `questions.en.json`. This is a one-time operation — run locally, commit the result.
2. **Store translations alongside questions:** Add optional `textEn` and `answersEn` fields to the `Question` type. The translation script populates these. The app uses them when `locale === "en"`.
3. **Human review:** Driving terms are safety-critical — review any automotive/legal terms after the automated pass.

**Translation script:** `scripts/translate-questions.ts`

```ts
// Uses DeepL free API (500k chars/month free)
// npm install @deepl-node
// Run: npx tsx scripts/translate-questions.ts
```

### 5d. LangContext

**New file: `lib/lang-context.tsx`**

```tsx
"use client";
import { createContext, useContext, useEffect, useState } from "react";
import type { Locale } from "./i18n";

const LangContext = createContext<{ locale: Locale; setLocale: (l: Locale) => void }>({
  locale: "he",
  setLocale: () => {},
});

export function LangProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("he");

  useEffect(() => {
    const saved = localStorage.getItem("theory-il:lang") as Locale | null;
    if (saved) setLocaleState(saved);
  }, []);

  function setLocale(l: Locale) {
    setLocaleState(l);
    localStorage.setItem("theory-il:lang", l);
    // Update html attrs dynamically
    document.documentElement.lang = l;
    document.documentElement.dir = l === "en" ? "ltr" : "rtl";
  }

  return <LangContext.Provider value={{ locale, setLocale }}>{children}</LangContext.Provider>;
}

export const useLang = () => useContext(LangContext);
```

Wrap `app/layout.tsx` body in `<LangProvider>`.

### 5e. Language toggle button

In `components/NavBar.tsx` (built in Phase 3), add a toggle:

```tsx
const { locale, setLocale } = useLang();
<button onClick={() => setLocale(locale === "he" ? "en" : "he")}>
  {locale === "he" ? "EN" : "עב"}
</button>
```

### 5f. Update QuestionCard for bilingual content

`QuestionCard.tsx` receives a `Question`. Extend the `Question` type with:

```ts
textEn?: string;
answersEn?: [string, string, string, string];
```

In the card: `const displayText = locale === "en" && question.textEn ? question.textEn : question.text`.

---

## File map: what gets created or modified

| File | Action | Phase |
|---|---|---|
| `lib/storage.ts` | Extend with `QuestionStats`, `recordAnswer`, `getQStats`, `StreakData`, `updateStreak`, `getStreak` | 1 |
| `components/TopicGridClient.tsx` | New — progress-aware topic grid | 1 |
| `components/StreakBadge.tsx` | New — streak display | 1 |
| `app/study/page.tsx` | Switch to TopicGridClient | 1 |
| `app/page.tsx` | Add StreakBadge | 1 |
| `app/study/[topic]/DrillClient.tsx` | Add weak-questions toggle, call recordAnswer | 1 |
| `app/results/[id]/page.tsx` | Batch-record answers, add score counter animation, add ShareCard + share button | 1, 2, 4 |
| `components/QuestionCard.tsx` | Add Framer Motion slide + swipe, answer micro-animations | 2 |
| `components/ExamRunner.tsx` | Add animated progress bar | 2 |
| `components/NavBar.tsx` | New — persistent nav with links + lang toggle | 3, 5 |
| `app/layout.tsx` | Add NavBar, add LangProvider | 3, 5 |
| `lib/srs.ts` | New — SM-2 via supermemo package | 3 |
| `app/flashcards/page.tsx` | New — topic picker showing due cards | 3 |
| `app/flashcards/[topic]/page.tsx` | New — server component | 3 |
| `components/FlashcardRunner.tsx` | New — flip card UI + SRS rating | 3 |
| `app/globals.css` | Add `.backface-hidden` utility | 3 |
| `components/ShareCard.tsx` | New — off-screen result card for PNG export | 4 |
| `lib/export.ts` | Add `exportResultCard` (html-to-image) | 4 |
| `lib/i18n.ts` | New — translation dictionary + `t()` | 5 |
| `lib/lang-context.tsx` | New — LangProvider + useLang | 5 |
| `scripts/translate-questions.ts` | New — one-time translation script | 5 |

---

## Library install summary

```bash
# Phase 2 — animation (one install for all animation features)
npm install motion

# Phase 3 — spaced repetition
npm install supermemo

# Phase 4 — image export
npm install html-to-image

# Phase 5 — translation script (dev-only, run once)
npm install --save-dev @deepl-node tsx
```

No other runtime dependencies are needed. The existing `docx` package stays; `supermemo` and `html-to-image` are small and tree-shakeable.

---

## Design notes

- All new UI inherits existing CSS variables (`--th-*`) from `globals.css`. Never hardcode colours.
- All text that touches the user is Hebrew-first. English strings live in `lib/i18n.ts`.
- RTL is already set at `<html dir="rtl">`. The English toggle flips it to `ltr` via `LangProvider`.
- Framer Motion's `AnimatePresence` must wrap only client components — never wrap server boundaries.
- The `ShareCard` PNG uses inline styles, not Tailwind, because `html-to-image` captures computed styles but may miss CSS variables if they are not resolved. Pre-resolve the tokens when building the card: pass `correct`, `passed`, `duration` as props and derive colours from JS constants.
- The SM-2 grade scale: 5 = perfect recall, 3 = recalled with effort, 1 = wrong. Do not use 0 (blanked) or 4/2 (unnecessary granularity for this use case).
- Streak resets at midnight — use `new Date().toISOString().slice(0, 10)` for timezone-safe date strings.
