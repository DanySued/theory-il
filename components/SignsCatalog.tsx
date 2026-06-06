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

const CATEGORY_ACCENT: Record<SignCategory, string> = {
  "אזהרה": "#f59e0b",
  "חובה": "#3b82f6",
  "איסור": "#ef4444",
  "מידע": "#22c55e",
  "סימוני כביש": "#94a3b8",
};

const CATEGORY_BADGE: Record<SignCategory, string> = {
  "אזהרה": "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300",
  "חובה": "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
  "איסור": "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
  "מידע": "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
  "סימוני כביש": "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
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

function SignCard({
  sign,
  index,
}: {
  sign: TrafficSign;
  index: number;
}) {
  const [flipped, setFlipped] = useState(false);
  const hasImage = !!sign.image;
  const description = sign.meaning ?? sign.behavior;
  const accent = CATEGORY_ACCENT[sign.category];

  if (!hasImage) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.02, duration: 0.2 }}
        className="rounded-2xl bg-[var(--th-card)] border border-[var(--th-border)] p-4 flex flex-col gap-2 transition-shadow hover:shadow-md"
        style={{ borderTop: `3px solid ${accent}` }}
      >
        {sign.officialNumber && (
          <span
            className="font-mono font-bold tabular-nums text-[var(--th-muted)] bg-[var(--th-muted-bg)] rounded-md px-2 py-0.5 self-start"
            style={{ fontSize: "clamp(0.65rem, 1.6vw, 0.8rem)" }}
          >
            {sign.officialNumber}
          </span>
        )}
        <span className="font-semibold text-[var(--th-fg)] leading-snug" style={{ fontSize: "clamp(0.75rem, 2vw, 0.9rem)" }}>
          {sign.name}
          {sign.isLightEmitting && (
            <span className="mr-1.5 text-[0.65em] font-bold px-1 rounded bg-yellow-200 text-yellow-900 dark:bg-yellow-500/20 dark:text-yellow-300">
              פ
            </span>
          )}
        </span>
        <span className="text-[var(--th-muted)] leading-relaxed" style={{ fontSize: "clamp(0.7rem, 1.8vw, 0.82rem)" }}>
          {description}
        </span>
        {sign.scope && (
          <span className="text-[var(--th-muted)] leading-relaxed" style={{ fontSize: "clamp(0.65rem, 1.6vw, 0.75rem)" }}>
            <span className="font-semibold text-[var(--th-fg-soft)]">כוחו יפה: </span>
            {sign.scope}
          </span>
        )}
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.02, duration: 0.2 }}
      style={{ perspective: "800px", aspectRatio: "4/5" }}
      className="relative"
    >
      <div
        onClick={() => setFlipped((f) => !f)}
        style={{
          position: "absolute",
          inset: 0,
          transformStyle: "preserve-3d",
          transition: "transform 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
          transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)",
          cursor: "pointer",
          borderRadius: "1rem",
        }}
        className="group"
      >
        {/* Front */}
        <div
          style={{
            backfaceVisibility: "hidden",
            WebkitBackfaceVisibility: "hidden",
            borderTop: `3px solid ${accent}`,
          }}
          className="absolute inset-0 rounded-2xl bg-[var(--th-card)] border border-[var(--th-border)] flex flex-col items-center justify-center gap-2 px-3 py-4 select-none transition-shadow group-hover:shadow-lg"
        >
          {sign.officialNumber && (
            <span
              className="absolute top-2 start-2 font-mono font-bold tabular-nums text-[var(--th-muted)] bg-[var(--th-muted-bg)] rounded px-1.5 py-0.5"
              style={{ fontSize: "clamp(0.65rem, 1.8vw, 0.82rem)" }}
            >
              {sign.officialNumber}
              {sign.isLightEmitting && (
                <span className="text-yellow-600 dark:text-yellow-400">פ</span>
              )}
            </span>
          )}
          {sign.imageUnverified && (
            <span
              className="absolute top-2 end-2 text-amber-400"
              style={{ fontSize: "clamp(0.65rem, 1.5vw, 0.75rem)" }}
              title="ייתכן שהתמונה אינה תואמת את התמרור"
            >
              *
            </span>
          )}

          <img
            src={sign.image}
            alt={sign.name}
            draggable={false}
            className="object-contain w-[45%] max-w-[70px]"
            style={{ flex: "0 0 auto" }}
          />

          <span
            className="text-center text-[var(--th-fg)] font-semibold leading-snug mt-1"
            style={{ fontSize: "clamp(0.68rem, 1.9vw, 0.85rem)" }}
          >
            {sign.name}
          </span>

          <span
            className="text-[var(--th-muted)] opacity-60 mt-auto"
            style={{ fontSize: "clamp(0.6rem, 1.4vw, 0.7rem)" }}
          >
            הקש לפרטים
          </span>
        </div>

        {/* Back */}
        <div
          style={{
            backfaceVisibility: "hidden",
            WebkitBackfaceVisibility: "hidden",
            transform: "rotateY(180deg)",
            borderTop: `3px solid ${accent}`,
          }}
          className="absolute inset-0 rounded-2xl bg-[var(--th-card)] border border-[var(--th-border)] flex flex-col items-center justify-center gap-3 px-4 py-4 select-none text-center"
        >
          <span
            className="font-bold text-[var(--th-fg)] leading-snug"
            style={{ fontSize: "clamp(0.75rem, 2.2vw, 0.95rem)" }}
          >
            {sign.name}
          </span>

          <span
            className="text-[var(--th-muted-strong)] leading-relaxed overflow-hidden"
            style={{
              fontSize: "clamp(0.72rem, 2vw, 0.88rem)",
              display: "-webkit-box",
              WebkitLineClamp: 5,
              WebkitBoxOrient: "vertical",
            }}
          >
            {description}
          </span>

          {sign.scope && (
            <span
              className="text-[var(--th-muted)] leading-relaxed"
              style={{
                fontSize: "clamp(0.66rem, 1.7vw, 0.78rem)",
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
              }}
            >
              <span className="font-semibold text-[var(--th-fg-soft)]">כוחו יפה: </span>
              {sign.scope}
            </span>
          )}
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

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
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
    <div className="w-full flex flex-col gap-6 mt-4">
      {/* Header + global progress */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-xl font-bold text-[var(--th-fg)]">מילון התמרורים</h2>
          <button
            onClick={handleExportSigns}
            disabled={exportLoading}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[var(--th-border)] text-xs font-medium hover:bg-[var(--th-muted-bg)] transition-colors disabled:opacity-50 shrink-0"
            title="ייצוא מילון התמרורים לקובץ Word"
          >
            {exportLoading ? "..." : "📄 ייצוא"}
          </button>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex-1 h-1.5 rounded-full bg-[var(--th-border)] overflow-hidden">
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
          לחץ על תמרור לראות את ההסבר
        </p>
      </div>


      {/* Categories */}
      {CATEGORY_ORDER.map((cat) => {
        const group = byCategory(cat);
        if (group.length === 0) return null;
        const isOpen = openCategories.has(cat);
        const { count, total } = catProgress(cat);
        const allDone = count === total && total > 0;
        const accent = CATEGORY_ACCENT[cat];

        return (
          <section key={cat}>
            <button
              onClick={() => toggle(cat)}
              className="w-full flex items-center justify-between gap-3 py-2.5 text-start group"
            >
              <div className="flex items-center gap-2.5">
                <span
                  className="w-2 h-2 rounded-full shrink-0"
                  style={{ background: accent }}
                />
                <span
                  className={`font-bold transition-colors ${
                    allDone
                      ? "text-green-600 dark:text-green-400"
                      : "text-[var(--th-fg)] group-hover:text-[var(--th-accent)]"
                  }`}
                  style={{ fontSize: "clamp(0.9rem, 2.5vw, 1.05rem)" }}
                >
                  {allDone && "✓ "}
                  {cat}
                </span>
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${CATEGORY_BADGE[cat]}`}>
                  {group.length}
                </span>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <div className="w-16 h-1 rounded-full bg-[var(--th-border)] overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${total > 0 ? (count / total) * 100 : 0}%`,
                      background: accent,
                    }}
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
                  style={{ overflow: "hidden" }}
                >
                  {/* Extra padding so hover shadow isn't clipped */}
                  <div className="pt-3 pb-4 px-1">
                    <div
                      className="grid gap-3"
                      style={{
                        gridTemplateColumns:
                          "repeat(auto-fill, minmax(clamp(130px, 22vw, 190px), 1fr))",
                      }}
                    >
                      {group.map((sign, i) => (
                        <SignCard
                          key={sign.id}
                          sign={sign}
                          index={i}
                        />
                      ))}
                    </div>
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
