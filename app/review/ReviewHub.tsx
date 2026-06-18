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
    <PageShell>
      <div role="tablist" aria-label="חזרה" className="flex gap-2 w-full">
        {TABS.map((t) => (
          <button
            key={t.id}
            role="tab"
            aria-selected={tab === t.id}
            onClick={() => select(t.id)}
            className={`flex-1 min-h-11 px-3 rounded-[var(--th-radius-lg)] text-sm font-semibold transition-colors ${
              tab === t.id
                ? "bg-[var(--th-accent)] text-white"
                : "bg-[var(--th-card)] border border-[var(--th-border)] text-[var(--th-muted-strong)] hover:border-[var(--th-accent)]"
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
