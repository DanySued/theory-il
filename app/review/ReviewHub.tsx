"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import PageShell from "@/components/PageShell";
import ReviewClient from "./ReviewClient";
import SavedClient from "@/app/saved/SavedClient";
import MistakesClient from "@/app/mistakes/MistakesClient";

const TABS = [
  { id: "hard", label: "חזרה חכמה" },
  { id: "saved", label: "שמורות" },
  { id: "mistakes", label: "הטעויות שלי" },
] as const;
type TabId = (typeof TABS)[number]["id"];

function isTab(v: string | null): v is TabId {
  return TABS.some((t) => t.id === v);
}

export default function ReviewHub() {
  const sp = useSearchParams();
  const initial = sp.get("tab");
  const [tab, setTab] = useState<TabId>(isTab(initial) ? initial : "hard");

  // Follow URL changes from any source: <Link> soft navigations (useSearchParams
  // is reactive in the App Router) and browser back/forward. popstate alone misses
  // pushState-based <Link> clicks, so the tab would desync on same-route nav.
  useEffect(() => {
    const t = sp.get("tab");
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setTab(isTab(t) ? t : "hard");
  }, [sp]);

  const select = (t: TabId) => {
    setTab(t);
    window.history.pushState(null, "", `/review?tab=${t}`);
  };

  return (
    <PageShell mobileBack={false}>
      {/* Phones: segmented control (card pill on a muted track); ≥sm: separate accent buttons */}
      <div
        role="tablist"
        aria-label="חזרה"
        className="grid grid-cols-3 sm:flex gap-1 sm:gap-2 w-full p-1 sm:p-0 rounded-[14px] sm:rounded-none bg-[var(--th-muted-bg)] sm:bg-transparent"
      >
        {TABS.map((t) => (
          <button
            key={t.id}
            role="tab"
            aria-selected={tab === t.id}
            onClick={() => select(t.id)}
            className={`flex-1 min-h-11 px-2 sm:px-3 rounded-[10px] sm:rounded-[var(--th-radius-lg)] text-[15px] sm:text-sm font-semibold transition-colors ${
              tab === t.id
                ? "bg-[var(--th-card)] sm:bg-[var(--th-accent)] text-[var(--th-fg)] sm:text-[var(--th-on-accent)] font-bold sm:font-semibold shadow-sm sm:shadow-none"
                : "sm:bg-[var(--th-card)] sm:border border-[var(--th-border)] text-[var(--th-muted-strong)] hover:border-[var(--th-accent)]"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>
      {tab === "hard" && <ReviewClient />}
      {tab === "saved" && <SavedClient />}
      {tab === "mistakes" && <MistakesClient />}
    </PageShell>
  );
}
