"use client";

import { useState } from "react";
import type { TrafficSign, SignCategory } from "@/lib/data/signs";
import { SIGNS } from "@/lib/data/signs";

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

export default function SignsCatalog({ signs }: Props) {
  const [openCategories, setOpenCategories] = useState<Set<SignCategory>>(
    new Set(CATEGORY_ORDER)
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
    <div className="w-full flex flex-col gap-6 mt-8">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-xl font-bold text-[var(--th-fg)]">מילון התמרורים</h2>
        <button
          onClick={handleExportSigns}
          disabled={exportLoading}
          className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-[var(--th-radius)] border border-[var(--th-border)] text-xs font-medium hover:bg-[var(--th-muted-bg)] transition-colors disabled:opacity-50"
          title="ייצוא מילון התמרורים לקובץ Word"
        >
          {exportLoading ? "..." : "📄 ייצוא לקובץ Word"}
        </button>
      </div>

      {CATEGORY_ORDER.map((cat) => {
        const group = byCategory(cat);
        if (group.length === 0) return null;
        const isOpen = openCategories.has(cat);

        return (
          <section key={cat}>
            <button
              onClick={() => toggle(cat)}
              className="w-full flex items-center justify-between gap-3 py-2 text-start"
            >
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold text-[var(--th-fg)]">{cat}</span>
                <span
                  className={`text-xs font-semibold px-2 py-0.5 rounded-full ${CATEGORY_BADGE[cat]}`}
                >
                  {group.length} תמרורים
                </span>
              </div>
              <span className="text-[var(--th-muted)] text-sm shrink-0">
                {isOpen ? "▲" : "▼"}
              </span>
            </button>

            {isOpen && (
              <div
                className="mt-3 grid gap-3"
                style={{ gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))" }}
              >
                {group.map((sign) => (
                  <div
                    key={sign.id}
                    className={`rounded-[var(--th-radius)] border border-[var(--th-border)] border-s-4 ${CATEGORY_COLOR[sign.category]} bg-[var(--th-card)] p-3 flex flex-col gap-1`}
                  >
                    {sign.image && (
                      <img
                        src={sign.image}
                        alt={sign.name}
                        className="w-20 h-20 object-contain mb-2"
                      />
                    )}
                    <span className="font-semibold text-sm text-[var(--th-fg)] leading-snug">
                      {sign.name}
                    </span>
                    <span className="text-xs text-[var(--th-muted)] leading-relaxed">
                      {sign.behavior}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </section>
        );
      })}
    </div>
  );
}
