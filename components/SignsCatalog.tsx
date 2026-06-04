"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import type { TrafficSign, SignCategory } from "@/lib/data/signs";

const MASTERED_KEY = "theory-il:signs-mastered";

const CATEGORY_ORDER: SignCategory[] = [
  "אזהרה",
  "חובה",
  "איסור",
  "מידע",
  "סימוני כביש",
];

const CATEGORY_COLOR: Record<SignCategory, string> = {
  "אזהרה": "border-amber-400",
  "חובה": "border-blue-500",
  "איסור": "border-red-500",
  "מידע": "border-green-600",
  "סימוני כביש": "border-gray-400",
};

const CATEGORY_BADGE: Record<SignCategory, string> = {
  "אזהרה": "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300",
  "חובה": "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
  "איסור": "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
  "מידע": "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
  "סימוני כביש": "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
};

interface Props {
  signs: TrafficSign[];
}

function getMastered(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    return new Set(JSON.parse(localStorage.getItem(MASTERED_KEY) ?? "[]") as string[]);
  } catch {
    return new Set();
  }
}

function saveMastered(ids: Set<string>): void {
  localStorage.setItem(MASTERED_KEY, JSON.stringify([...ids]));
}

function SignCard({
  sign,
  mastered,
  onToggleMastered,
  index,
}: {
  sign: TrafficSign;
  mastered: boolean;
  onToggleMastered: (id: string) => void;
  index: number;
}) {
  const [flipped, setFlipped] = useState(false);
  const hasImage = !!sign.image;

  if (!hasImage) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.025, duration: 0.18 }}
        className={`rounded-[var(--th-radius)] border border-[var(--th-border)] border-s-4 ${CATEGORY_COLOR[sign.category]} bg-[var(--th-card)] p-3 flex flex-col gap-1 transition-opacity ${mastered ? "opacity-60" : ""}`}
      >
        <div className="flex items-start justify-between gap-1">
          <span className="font-semibold text-sm text-[var(--th-fg)] leading-snug">
            {sign.name}
            {sign.imageUnverified && (
              <span
                className="text-amber-500"
                title="ייתכן שהתמונה אינה תואמת את התמרור — לא אומת מול מקור רשמי"
                aria-label="התמונה אינה מאומתת"
              >
                {" *"}
              </span>
            )}
          </span>
          {mastered && <span className="text-green-500 text-xs shrink-0">✓</span>}
        </div>
        <span className="text-xs text-[var(--th-muted)] leading-relaxed">{sign.behavior}</span>
        <button
          onClick={() => onToggleMastered(sign.id)}
          className={`self-start text-[10px] px-2 py-0.5 rounded-full border transition-all mt-1 ${
            mastered
              ? "bg-green-100 border-green-400 text-green-700 dark:bg-green-900/30 dark:border-green-600 dark:text-green-300"
              : "border-[var(--th-border)] text-[var(--th-muted)] hover:border-green-400 hover:text-green-600"
          }`}
        >
          {mastered ? "✓ שלטתי" : "שלטתי"}
        </button>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.025, duration: 0.18 }}
      whileHover={{ scale: flipped ? 1 : 1.03 }}
      style={{ perspective: "600px", height: "172px" }}
    >
      <div
        style={{
          position: "relative",
          width: "100%",
          height: "100%",
          transformStyle: "preserve-3d",
          transition: "transform 0.38s cubic-bezier(0.4, 0, 0.2, 1)",
          transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)",
          cursor: "pointer",
        }}
        onClick={() => setFlipped((f) => !f)}
      >
        {/* Front: image + sign name */}
        <div
          style={{ backfaceVisibility: "hidden" }}
          className={`absolute inset-0 rounded-[var(--th-radius)] border border-[var(--th-border)] border-s-4 ${CATEGORY_COLOR[sign.category]} bg-[var(--th-card)] p-3 flex flex-col items-center justify-center gap-1 select-none`}
        >
          {mastered && (
            <span className="absolute top-2 start-2 text-green-500 text-[11px] font-bold">✓</span>
          )}
          {sign.imageUnverified && (
            <span
              className="absolute top-1.5 end-1.5 text-amber-500 text-sm font-bold leading-none cursor-help"
              title="ייתכן שהתמונה אינה תואמת את התמרור — לא אומת מול מקור רשמי"
              aria-label="התמונה אינה מאומתת"
            >
              *
            </span>
          )}
          <img
            src={sign.image}
            alt={sign.name}
            className="w-16 h-16 object-contain"
            draggable={false}
          />
          <span className="text-[10px] text-[var(--th-fg)] text-center leading-snug mt-1 line-clamp-2 font-medium">
            {sign.name}
            {sign.imageUnverified && <span className="text-amber-500"> *</span>}
          </span>
          <span className="text-[9px] text-[var(--th-muted)] opacity-50 mt-0.5">הקש לפרטים ←</span>
        </div>

        {/* Back: description + mastered button */}
        <div
          style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
          className={`absolute inset-0 rounded-[var(--th-radius)] border border-[var(--th-border)] border-s-4 ${CATEGORY_COLOR[sign.category]} bg-[var(--th-card)] p-3 flex flex-col gap-2 justify-between select-none`}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex flex-col gap-1 overflow-hidden">
            <span className="font-semibold text-xs text-[var(--th-fg)] leading-snug">{sign.name}</span>
            <span className="text-[10px] text-[var(--th-muted)] leading-relaxed line-clamp-4">
              {sign.behavior}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleMastered(sign.id);
              }}
              className={`text-[10px] px-2 py-0.5 rounded-full border transition-all ${
                mastered
                  ? "bg-green-100 border-green-400 text-green-700 dark:bg-green-900/30 dark:border-green-600 dark:text-green-300"
                  : "border-[var(--th-border)] text-[var(--th-muted)] hover:border-green-400 hover:text-green-600"
              }`}
            >
              {mastered ? "✓ שלטתי" : "שלטתי"}
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setFlipped(false);
              }}
              className="text-[10px] text-[var(--th-muted)] hover:text-[var(--th-fg)] transition-colors underline underline-offset-2"
            >
              ← חזרה
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default function SignsCatalog({ signs }: Props) {
  const [openCategories, setOpenCategories] = useState<Set<SignCategory>>(
    new Set(CATEGORY_ORDER)
  );
  const [mastered, setMastered] = useState<Set<string>>(new Set());
  const [exportLoading, setExportLoading] = useState(false);
  const [justMasteredCat, setJustMasteredCat] = useState<SignCategory | null>(null);

  useEffect(() => {
    setMastered(getMastered());
  }, []);

  const toggle = (cat: SignCategory) => {
    setOpenCategories((prev) => {
      const next = new Set(prev);
      if (next.has(cat)) next.delete(cat);
      else next.add(cat);
      return next;
    });
  };

  const toggleMastered = (id: string) => {
    setMastered((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
        const sign = signs.find((s) => s.id === id);
        if (sign) {
          const catSigns = signs.filter((s) => s.category === sign.category);
          if (catSigns.every((s) => next.has(s.id))) {
            setJustMasteredCat(sign.category);
            setTimeout(() => setJustMasteredCat(null), 3000);
          }
        }
      }
      saveMastered(next);
      return next;
    });
  };

  const byCategory = (cat: SignCategory) => signs.filter((s) => s.category === cat);

  const catProgress = (cat: SignCategory) => {
    const group = byCategory(cat);
    return { count: group.filter((s) => mastered.has(s.id)).length, total: group.length };
  };

  const totalMastered = signs.filter((s) => mastered.has(s.id)).length;
  const totalCount = signs.length;
  const pct = totalCount > 0 ? (totalMastered / totalCount) * 100 : 0;

  async function handleExportSigns() {
    setExportLoading(true);
    try {
      const { exportSignsToDocx } = await import("@/lib/export");
      await exportSignsToDocx(signs);
    } finally {
      setExportLoading(false);
    }
  }

  return (
    <div className="w-full flex flex-col gap-5 mt-4">
      {/* Header + global progress */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-xl font-bold text-[var(--th-fg)]">מילון התמרורים</h2>
          <button
            onClick={handleExportSigns}
            disabled={exportLoading}
            className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-[var(--th-radius)] border border-[var(--th-border)] text-xs font-medium hover:bg-[var(--th-muted-bg)] transition-colors disabled:opacity-50 shrink-0"
            title="ייצוא מילון התמרורים לקובץ Word"
          >
            {exportLoading ? "..." : "📄 ייצוא"}
          </button>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex-1 h-2 rounded-full bg-[var(--th-border)] overflow-hidden">
            <motion.div
              className="h-full bg-green-500 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${pct}%` }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            />
          </div>
          <span className="text-xs text-[var(--th-muted)] whitespace-nowrap shrink-0 tabular-nums">
            {totalMastered} / {totalCount}
          </span>
        </div>

        <p className="text-xs text-[var(--th-muted)]">
          לחץ על תמרור להפוך אותו ולראות את ההסבר · סמן ✓ כשאתה שולט בו
        </p>
      </div>

      {/* Category-complete toast */}
      <AnimatePresence>
        {justMasteredCat && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            className="fixed top-20 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-2xl bg-green-500 text-white text-sm font-bold shadow-xl pointer-events-none"
          >
            🎉 שלטת בכל תמרורי {justMasteredCat}!
          </motion.div>
        )}
      </AnimatePresence>

      {/* Categories */}
      {CATEGORY_ORDER.map((cat) => {
        const group = byCategory(cat);
        if (group.length === 0) return null;
        const isOpen = openCategories.has(cat);
        const { count, total } = catProgress(cat);
        const allDone = count === total && total > 0;

        return (
          <section key={cat}>
            <button
              onClick={() => toggle(cat)}
              className="w-full flex items-center justify-between gap-3 py-2 text-start group"
            >
              <div className="flex items-center gap-2">
                <span
                  className={`text-base font-bold transition-colors ${
                    allDone
                      ? "text-green-600 dark:text-green-400"
                      : "text-[var(--th-fg)] group-hover:text-[var(--th-accent)]"
                  }`}
                >
                  {allDone && "✓ "}
                  {cat}
                </span>
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${CATEGORY_BADGE[cat]}`}>
                  {group.length}
                </span>
                <span className="text-xs text-[var(--th-muted)] tabular-nums">
                  {count}/{total}
                </span>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <div className="w-20 h-1.5 rounded-full bg-[var(--th-border)] overflow-hidden">
                  <div
                    className="h-full bg-green-500 rounded-full transition-all duration-500"
                    style={{ width: `${total > 0 ? (count / total) * 100 : 0}%` }}
                  />
                </div>
                <span className="text-[var(--th-muted)] text-xs">{isOpen ? "▲" : "▼"}</span>
              </div>
            </button>

            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  key={cat + "-content"}
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.22, ease: "easeInOut" }}
                  className="overflow-hidden"
                >
                  <div
                    className="mt-3 grid gap-3"
                    style={{ gridTemplateColumns: "repeat(auto-fill, minmax(155px, 1fr))" }}
                  >
                    {group.map((sign, i) => (
                      <SignCard
                        key={sign.id}
                        sign={sign}
                        mastered={mastered.has(sign.id)}
                        onToggleMastered={toggleMastered}
                        index={i}
                      />
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </section>
        );
      })}
    </div>
  );
}
