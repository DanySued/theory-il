"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ChevronDown, Check, RotateCcw } from "lucide-react";
import type { TrafficSign, SignCategory } from "@/lib/data/signs";
import { getKnownSigns, toggleKnownSign, clearKnownSigns } from "@/lib/storage";
import ProgressBar from "@/components/ProgressBar";
import { CATEGORY_ORDER } from "@/lib/constants";

const CATEGORY_ACCENT: Record<SignCategory, string> = {
  "אזהרה": "var(--th-cat-warning)",
  "חובה": "var(--th-cat-mandatory)",
  "איסור": "var(--th-cat-prohibition)",
  "מידע": "var(--th-cat-info)",
  "סימוני כביש": "var(--th-cat-road)",
};

interface GuideSection {
  body: string;
  points?: string[];
}

interface Props {
  signs: TrafficSign[];
  guideSections?: Partial<Record<SignCategory, GuideSection>>;
}

function SignCard({
  sign,
  known,
  onToggle,
}: {
  sign: TrafficSign;
  known: boolean;
  onToggle: (id: string) => void;
}) {
  const description = sign.meaning || sign.behavior;
  const accent = CATEGORY_ACCENT[sign.category];

  return (
    <button
      type="button"
      onClick={() => onToggle(sign.id)}
      aria-pressed={known}
      title={known ? "לחץ כדי לחשוף את התמרור" : "לחץ אם אתה זוכר את התמרור"}
      className="relative text-start rounded-[var(--th-radius-lg)] bg-[var(--th-card)] border border-[var(--th-border)] flex flex-col items-center justify-center gap-1.5 px-3 pt-7 pb-3 transition-shadow hover:shadow-md cursor-pointer"
      style={{
        borderTop: `3px solid ${accent}`,
        minHeight: "190px",
        ...(known ? { borderColor: "var(--th-success)", background: "var(--th-success-soft)" } : {}),
      }}
    >
      {sign.officialNumber && (
        <span
          className="absolute top-2 start-2 font-mono font-bold tabular-nums text-[var(--th-muted)] bg-[var(--th-muted-bg)] rounded-[var(--th-radius-sm)] px-1.5 py-0.5"
          style={{ fontSize: "0.65rem" }}
        >
          {sign.officialNumber}
        </span>
      )}

      {known ? (
        <span className="absolute top-2 end-2 text-[var(--th-success)]" title="סומן כידוע">
          <Check size={14} strokeWidth={3} />
        </span>
      ) : (
        sign.imageUnverified && (
          <span
            className="absolute top-2 end-2 text-[var(--th-cat-warning)] text-xs"
            title="ייתכן שהתמונה אינה תואמת את התמרור"
          >
            *
          </span>
        )
      )}

      {known ? (
        <div className="h-[72px] w-[72px] shrink-0 flex items-center justify-center rounded-full border-2 border-[var(--th-success)] text-[var(--th-success)]">
          <Check size={26} strokeWidth={3} />
        </div>
      ) : sign.image ? (
        <img
          src={sign.image}
          alt={sign.name}
          draggable={false}
          loading="lazy"
          className="shrink-0 w-[72px] h-[72px] object-contain"
        />
      ) : (
        <div className="h-[72px] shrink-0" />
      )}

      <span
        className="text-center text-[var(--th-fg)] font-semibold leading-snug line-clamp-2 w-full"
        style={{ fontSize: "0.78rem" }}
      >
        {sign.name}
      </span>

      {description && (
        <span
          className="text-center text-[var(--th-muted)] leading-relaxed line-clamp-3 w-full"
          style={{ fontSize: "0.7rem" }}
        >
          {description}
        </span>
      )}

      {sign.scope && (
        <span
          className="text-center text-[var(--th-muted)] line-clamp-2 w-full mt-auto"
          style={{ fontSize: "0.64rem" }}
        >
          <span className="font-semibold text-[var(--th-fg-soft)]">כוחו יפה: </span>
          {sign.scope}
        </span>
      )}
    </button>
  );
}

export default function SignsCatalog({ signs, guideSections }: Props) {
  const [openCategories, setOpenCategories] = useState<Set<SignCategory>>(new Set());
  const [knownSigns, setKnownSigns] = useState<Set<string>>(new Set());

  useEffect(() => {
    setKnownSigns(getKnownSigns());
  }, []);

  const handleToggleKnown = (id: string) => {
    setKnownSigns(new Set(toggleKnownSign(id)));
  };

  const handleReset = () => {
    clearKnownSigns();
    setKnownSigns(new Set());
  };

  const totalSigns = signs.length;
  const totalKnown = signs.reduce((n, s) => (knownSigns.has(s.id) ? n + 1 : n), 0);

  const toggle = (cat: SignCategory) => {
    setOpenCategories((prev) => {
      const next = new Set(prev);
      if (next.has(cat)) next.delete(cat);
      else next.add(cat);
      return next;
    });
  };

  const byCategory = (cat: SignCategory) => signs.filter((s) => s.category === cat);
  const knownCount = (group: TrafficSign[]) =>
    group.reduce((n, s) => (knownSigns.has(s.id) ? n + 1 : n), 0);

  return (
    <div className="w-full flex flex-col gap-5">
      {/* Header — overall progress */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-3">
          <span className="font-mono tabular-nums text-sm text-[var(--th-muted)] shrink-0">
            {totalKnown}/{totalSigns}
          </span>
          <ProgressBar current={totalKnown} total={totalSigns} className="flex-1" />
          <button
            type="button"
            onClick={handleReset}
            disabled={totalKnown === 0}
            title="איפוס ההתקדמות"
            className="shrink-0 flex items-center gap-1 text-xs text-[var(--th-muted)] hover:text-[var(--th-fg)] disabled:opacity-40 disabled:cursor-default transition-colors"
          >
            <RotateCcw size={13} strokeWidth={2} />
            איפוס
          </button>
        </div>
        <span className="text-xs text-[var(--th-muted)]">
          {totalKnown === totalSigns
            ? "כל הכבוד! סימנת שאתה זוכר את כל התמרורים"
            : "לחץ על תמרור שאתה זוכר כדי להסתירו ולעקוב אחר ההתקדמות"}
        </span>
      </div>

      {/* Categories */}
      {CATEGORY_ORDER.map((cat) => {
        const group = byCategory(cat);
        if (group.length === 0) return null;
        const isOpen = openCategories.has(cat);
        const accent = CATEGORY_ACCENT[cat];
        const guideSection = guideSections?.[cat];
        const total = group.length;
        const done = knownCount(group);

        return (
          <section key={cat}>
            <button
              onClick={() => toggle(cat)}
              className={`sticky top-14 z-20 w-full flex items-center justify-between gap-3 py-3 px-4 text-start
                border border-[var(--th-border)] transition-all group
                ${isOpen
                  ? "rounded-t-[var(--th-radius-lg)] border-b-transparent shadow-sm"
                  : "rounded-[var(--th-radius-lg)]"
                }
              `}
              style={{
                "--cat-accent": accent,
                backgroundColor: "var(--th-bg)",
                backgroundImage: isOpen
                  ? `linear-gradient(color-mix(in srgb, ${accent} 25%, transparent), color-mix(in srgb, ${accent} 25%, transparent))`
                  : undefined,
                ...(isOpen ? { borderBottom: `2px solid ${accent}` } : {}),
              } as React.CSSProperties}
            >
              <div className="flex flex-col gap-1.5 flex-1 min-w-0">
                <div className="flex items-center gap-2.5">
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0 transition-transform duration-200"
                    style={{ background: accent, transform: isOpen ? "scale(1.3)" : "scale(1)" }}
                  />
                  <span
                    className="font-bold transition-colors text-[var(--th-fg)] group-hover:text-[var(--cat-accent)]"
                    style={{ fontSize: isOpen ? "calc(clamp(1rem, 2.8vw, 1.15rem) + 5px)" : "clamp(1rem, 2.8vw, 1.15rem)" }}
                  >
                    {cat}
                  </span>
                  <span
                    className="ms-auto font-mono tabular-nums text-[var(--th-muted)] shrink-0"
                    style={{ fontSize: "0.72rem" }}
                  >
                    {done}/{total}
                  </span>
                </div>
                <ProgressBar current={done} total={total} />
              </div>
              <motion.div
                animate={{ rotate: isOpen ? 180 : 0 }}
                transition={{ duration: 0.2 }}
                className="text-[var(--th-muted)] group-hover:text-[var(--cat-accent)] transition-colors shrink-0"
              >
                <ChevronDown size={16} strokeWidth={2} />
              </motion.div>
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
                  className="border border-[var(--th-border)] border-t-0 rounded-b-[var(--th-radius-lg)]"
                >
                  <div className="pt-4 pb-5 px-4 flex flex-col gap-4">
                    {guideSection && (
                      <div className="flex flex-col gap-2 pb-2 border-b border-[var(--th-border)]">
                        <p className="text-sm text-[var(--th-muted-strong)] leading-relaxed max-w-prose">
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

                    <div
                      className="grid gap-3"
                      style={{
                        gridTemplateColumns: "repeat(auto-fit, minmax(140px, 156px))",
                        justifyContent: "center",
                      }}
                    >
                      {group.map((sign) => (
                        <SignCard
                          key={sign.id}
                          sign={sign}
                          known={knownSigns.has(sign.id)}
                          onToggle={handleToggleKnown}
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
