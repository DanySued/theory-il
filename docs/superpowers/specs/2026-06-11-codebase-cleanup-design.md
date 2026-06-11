# Codebase Cleanup & Organization — Design Spec
**Date:** 2026-06-11  
**Repo:** theory-il  
**Approach:** Option C — Code hygiene + repo cleanup + light refactoring, followed by ultra code-review bug pass

---

## 1. Shared Constants (`lib/constants.ts`)

Extract duplicated literals into a single source of truth.

**`LABELS`** — `["א", "ב", "ג", "ד"]` currently lives in four files:
- `components/ExamRunner.tsx:10`
- `components/QuestionCard.tsx:34`
- `app/results/[id]/page.tsx:12`
- `lib/export.ts:5`

**`CATEGORY_ORDER`** — `["אזהרה", "חובה", "איסור", "מידע", "סימוני כביש"]` duplicated in:
- `components/SignsCatalog.tsx:10-16`
- `lib/export.ts:118-124`

**Action:** Create `lib/constants.ts` exporting both. Update all six files to import from there.

---

## 2. `useRipple` Custom Hook (`hooks/useRipple.ts`)

The ripple effect is implemented identically in `ExamRunner.tsx` and `QuestionCard.tsx`:
- `ripples` state (`{ id, x, y, btnIdx }[]`)
- `rippleCounter` ref
- `addRipple(e, btnIdx)` function
- `<AnimatePresence>` + `<motion.span>` markup per button

**Action:** Extract to `hooks/useRipple.ts` returning `{ ripples, addRipple }`. Update both components to call `useRipple()` instead.

---

## 3. Dead Code Removal

**`QuestionCard.tsx` aliased variables (lines 104–106):**
```ts
const displayText = question.text;        // pure alias
const displayAnswers = question.answers;  // pure alias
const displayExplanation = question.explanation; // pure alias
```
These add no value — the original properties are used directly in JSX. Remove the aliases and reference `question.text` etc. directly.

**Hidden `ExportMenu` in `DrillClient.tsx` (line 148):**
```tsx
<span className="hidden"><ExportMenu topic={topic} questions={questions} /></span>
```
This mounts a component (including its state/effects) while permanently hiding it. Remove the wrapper span and the `ExportMenu` import.

---

## 4. ESLint Suppression Cleanup

Six `// eslint-disable-next-line react-hooks/set-state-in-effect` comments are scattered across:
- `FlashcardRunner.tsx:26`
- `DrillClient.tsx:56`
- `StreakBadge.tsx:15`
- `results/[id]/page.tsx:33`
- `retake/[sourceId]/page.tsx:25`
- `SignsCatalog.tsx:141`

All are suppressing the same pattern: calling `setState` inside `useEffect` without a functional guard. The correct fix is to call setState normally in useEffect — React 19 handles this fine, and `set-state-in-effect` is a stylistic lint rule, not a runtime error. Remove the suppression comments; no logic changes needed.

---

## 5. `lib/export.ts` — Docx Paragraph Helper

The same `new Paragraph({ children: [new TextRun({...})], alignment, bidirectional, spacing })` pattern is repeated 15+ times across three export functions. A local `rtlPara(text, opts)` helper reduces noise without changing any exported API.

**Scope:** internal to `lib/export.ts` only — helper not exported.

---

## 6. Repo Root Cleanup

Delete stale planning artifacts that are fully superseded by the implemented codebase:

| File | Reason to delete |
|---|---|
| `plan.md` | v2 plan — all features listed are implemented |
| `IMPROVEMENTS.md` | Improvement wishlist — superseded; findings are in git history |
| `SIGNS_TO_SEARCH.md` | Working notes for sign research — done |
| `_svg_preview.png` | Design-process screenshot |
| `exam-page.png` | Design-process screenshot |
| `flashcards-list.png` | Design-process screenshot |
| `signs-current.png` | Design-process screenshot |
| `signs-expanded.png` | Design-process screenshot |
| `signs-page-current.png` | Design-process screenshot |
| `signs-page-open.png` | Design-process screenshot |

`limud/` (PDFs + source.md) and `docs/` stay — they are reference material.

---

## 7. Ultra Code-Review Bug Pass

After all changes are committed, run `/code-review ultra` on the full diff. This dispatches multiple parallel reviewers and applies any found bugs or further simplifications. This is the "highest potential" pass — it will catch anything missed in steps 1–6.

---

## Order of Execution

1. Create `lib/constants.ts`, update imports across 6 files
2. Create `hooks/useRipple.ts`, update `ExamRunner` + `QuestionCard`
3. Remove dead aliases in `QuestionCard`
4. Remove hidden `ExportMenu` mount in `DrillClient`
5. Remove 6 eslint-disable comments
6. Add `rtlPara` helper in `lib/export.ts`
7. Delete stale root files (11 files)
8. Commit everything
9. Run ultra code-review + apply fixes
10. Push to GitHub → Vercel auto-deploys

---

## Risk Assessment

- Steps 1–7 are all mechanical/safe — no logic changes
- The ripple extraction (step 2) changes two interactive components; verify visually that ripples still work post-refactor
- No new dependencies added
- No route or API surface changes
