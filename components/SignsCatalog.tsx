"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ChevronDown, AlignLeft } from "lucide-react";
import type { TrafficSign, SignCategory } from "@/lib/data/signs";

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

interface GuideSection {
  body: string;
  points?: string[];
}

interface Props {
  signs: TrafficSign[];
  guideIntro?: string;
  guideSections?: Partial<Record<SignCategory, GuideSection>>;
}

function SignCard({
  sign,
  index,
  showDescription,
}: {
  sign: TrafficSign;
  index: number;
  showDescription: boolean;
}) {
  const hasImage = !!sign.image;
  const description = sign.meaning ?? sign.behavior;
  const accent = CATEGORY_ACCENT[sign.category];

  // No-image card
  if (!hasImage) {
    if (!showDescription) {
      return (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.02, duration: 0.2 }}
          className="rounded-2xl bg-[var(--th-card)] border border-[var(--th-border)] flex flex-col items-center justify-center gap-1.5 py-5 px-2 text-center"
          style={{ borderTop: `3px solid ${accent}` }}
        >
          {sign.officialNumber && (
            <span
              className="font-mono font-bold tabular-nums text-[var(--th-muted)] bg-[var(--th-muted-bg)] rounded-md px-2 py-0.5"
              style={{ fontSize: "clamp(0.65rem, 1.6vw, 0.8rem)" }}
            >
              {sign.officialNumber}
            </span>
          )}
          <span className="font-semibold text-[var(--th-fg)] leading-snug" style={{ fontSize: "clamp(0.72rem, 1.9vw, 0.88rem)" }}>
            {sign.name}
          </span>
        </motion.div>
      );
    }

    return (
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.02, duration: 0.2 }}
        className="rounded-2xl bg-[var(--th-card)] border border-[var(--th-border)] p-4 flex flex-col gap-2"
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

  // Image card — compact (description off)
  if (!showDescription) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.02, duration: 0.2 }}
        className="aspect-square rounded-2xl bg-[var(--th-card)] border border-[var(--th-border)] flex flex-col items-center justify-center gap-2 px-2 relative"
        style={{ borderTop: `3px solid ${accent}` }}
      >
        {sign.officialNumber && (
          <span
            className="font-mono font-bold tabular-nums text-[var(--th-muted)] bg-[var(--th-muted-bg)] rounded px-1.5 py-0.5"
            style={{ fontSize: "clamp(0.62rem, 1.6vw, 0.78rem)" }}
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
          className="object-contain w-[55%] max-w-[80px]"
        />
      </motion.div>
    );
  }

  // Image card — full (description on)
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.02, duration: 0.2 }}
      className="rounded-2xl bg-[var(--th-card)] border border-[var(--th-border)] flex flex-col gap-2 p-4 relative"
      style={{ borderTop: `3px solid ${accent}` }}
    >
      <div className="flex items-center justify-between gap-1">
        {sign.officialNumber ? (
          <span
            className="font-mono font-bold tabular-nums text-[var(--th-muted)] bg-[var(--th-muted-bg)] rounded px-1.5 py-0.5"
            style={{ fontSize: "clamp(0.62rem, 1.6vw, 0.78rem)" }}
          >
            {sign.officialNumber}
            {sign.isLightEmitting && (
              <span className="text-yellow-600 dark:text-yellow-400">פ</span>
            )}
          </span>
        ) : <span />}
        {sign.imageUnverified && (
          <span
            className="text-amber-400"
            style={{ fontSize: "clamp(0.65rem, 1.5vw, 0.75rem)" }}
            title="ייתכן שהתמונה אינה תואמת את התמרור"
          >
            *
          </span>
        )}
      </div>

      <div className="flex items-center justify-center py-2">
        <img
          src={sign.image}
          alt={sign.name}
          draggable={false}
          className="object-contain w-[45%] max-w-[70px]"
        />
      </div>

      <span
        className="font-semibold text-[var(--th-fg)] leading-snug text-center"
        style={{ fontSize: "clamp(0.72rem, 2vw, 0.88rem)" }}
      >
        {sign.name}
      </span>

      <span
        className="text-[var(--th-muted)] leading-relaxed"
        style={{ fontSize: "clamp(0.68rem, 1.8vw, 0.82rem)" }}
      >
        {description}
      </span>

      {sign.scope && (
        <span
          className="text-[var(--th-muted)] leading-relaxed"
          style={{ fontSize: "clamp(0.63rem, 1.6vw, 0.74rem)" }}
        >
          <span className="font-semibold text-[var(--th-fg-soft)]">כוחו יפה: </span>
          {sign.scope}
        </span>
      )}
    </motion.div>
  );
}

export default function SignsCatalog({ signs, guideIntro, guideSections }: Props) {
  const [openCategories, setOpenCategories] = useState<Set<SignCategory>>(new Set());
  const [descriptionOn, setDescriptionOn] = useState<Record<SignCategory, boolean>>(
    Object.fromEntries(CATEGORY_ORDER.map((cat) => [cat, true])) as Record<SignCategory, boolean>
  );
  const [exportLoading, setExportLoading] = useState(false);

  const toggle = (cat: SignCategory) => {
    setOpenCategories((prev) => {
      const next = new Set(prev);
      if (next.has(cat)) next.delete(cat);
      else next.add(cat);
      return next;
    });
  };

  const toggleDescription = (cat: SignCategory, e: React.MouseEvent) => {
    e.stopPropagation();
    setDescriptionOn((prev) => ({ ...prev, [cat]: !prev[cat] }));
  };

  const byCategory = (cat: SignCategory) => signs.filter((s) => s.category === cat);

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
    <div className="w-full flex flex-col gap-4 mt-4">
      {/* Header */}
      <div className="flex flex-col gap-3">
        <h2 className="text-2xl font-bold text-[var(--th-fg)]">מילון התמרורים</h2>
        <button
          onClick={handleExportSigns}
          disabled={exportLoading}
          className="hidden"
          title="ייצוא מילון התמרורים לקובץ Word"
        >
          {exportLoading ? "..." : "📄 ייצוא"}
        </button>

        {guideIntro ? (
          <p className="text-xs text-[var(--th-muted)] leading-relaxed">{guideIntro}</p>
        ) : (
          <p className="text-xs text-[var(--th-muted)]">פתח קטגוריה וגלול — ההסבר מופיע ישירות על הכרטיסייה</p>
        )}
      </div>

      {/* Categories */}
      {CATEGORY_ORDER.map((cat) => {
        const group = byCategory(cat);
        if (group.length === 0) return null;
        const isOpen = openCategories.has(cat);
        const accent = CATEGORY_ACCENT[cat];
        const guideSection = guideSections?.[cat];
        const descOn = descriptionOn[cat];

        return (
          <section key={cat}>
            {/* Category header — sticky */}
            <button
              onClick={() => toggle(cat)}
              className={`sticky top-14 z-20 w-full flex items-center justify-between gap-3 py-3 px-4 text-start
                border border-[var(--th-border)] transition-all group
                bg-[var(--th-bg)]
                ${isOpen
                  ? "rounded-t-2xl border-b-transparent shadow-sm"
                  : "rounded-2xl hover:bg-[var(--th-muted-bg)]"
                }
              `}
              style={isOpen ? { borderBottom: `2px solid ${accent}` } : {}}
            >
              <div className="flex items-center gap-2.5">
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0 transition-transform duration-200"
                  style={{ background: accent, transform: isOpen ? "scale(1.3)" : "scale(1)" }}
                />
                <span
                  className={`font-bold transition-colors ${
                    isOpen
                      ? "text-[var(--th-fg)]"
                      : "text-[var(--th-fg)] group-hover:text-[var(--th-accent)]"
                  }`}
                  style={{ fontSize: "clamp(1rem, 2.8vw, 1.15rem)" }}
                >
                  {cat}
                </span>
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${CATEGORY_BADGE[cat]}`}>
                  {group.length}
                </span>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {/* Description toggle — only when category is open */}
                {isOpen && (
                  <div
                    onClick={(e) => toggleDescription(cat, e)}
                    role="button"
                    aria-pressed={descOn}
                    className={`flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full border transition-all select-none
                      ${descOn
                        ? "border-[var(--th-accent)] text-[var(--th-accent)] bg-[var(--th-accent)]/10"
                        : "border-[var(--th-border)] text-[var(--th-muted)] bg-transparent hover:border-[var(--th-muted)]"
                      }
                    `}
                  >
                    <AlignLeft size={11} strokeWidth={2.5} />
                    הסבר
                  </div>
                )}

                <motion.div
                  animate={{ rotate: isOpen ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                  className="text-[var(--th-muted)]"
                >
                  <ChevronDown size={16} strokeWidth={2} />
                </motion.div>
              </div>
            </button>

            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  key={cat + "-content"}
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.25, ease: "easeInOut" }}
                  style={{ overflow: "hidden" }}
                  className="border border-[var(--th-border)] border-t-0 rounded-b-2xl"
                >
                  <div className="pt-4 pb-5 px-4 flex flex-col gap-4">
                    {/* Guide section text */}
                    {guideSection && (
                      <div className="flex flex-col gap-2 pb-2 border-b border-[var(--th-border)]">
                        <p className="text-sm text-[var(--th-muted-strong)] leading-relaxed">
                          {guideSection.body}
                        </p>
                        {guideSection.points && (
                          <ul className="flex flex-col gap-1.5 mt-1">
                            {guideSection.points.map((pt, i) => (
                              <li key={i} className="flex gap-2 text-sm">
                                <span className="shrink-0 mt-0.5" style={{ color: accent }}>•</span>
                                <span className="text-[var(--th-muted)]">{pt}</span>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    )}

                    {/* Signs grid */}
                    <div
                      className="grid gap-3"
                      style={{
                        gridTemplateColumns: descOn
                          ? "repeat(auto-fill, minmax(clamp(150px, 22vw, 210px), 1fr))"
                          : "repeat(auto-fill, minmax(clamp(90px, 15vw, 130px), 1fr))",
                      }}
                    >
                      {group.map((sign, i) => (
                        <SignCard key={sign.id} sign={sign} index={i} showDescription={descOn} />
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
