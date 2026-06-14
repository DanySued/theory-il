"use client";

import { useState, useEffect, useRef } from "react";
import PageShell from "@/components/PageShell";
import SectionHead from "@/components/SectionHead";
import {
  summarizeBuckets,
  downloadBackup,
  importAll,
  clearBucket,
  clearAll,
  type BucketSummary,
  type BucketKey,
  type ImportResult,
} from "@/lib/backup";

type Toast = { kind: "success" | "error" | "info"; text: string } | null;

function formatBytes(n: number): string {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / (1024 * 1024)).toFixed(1)} MB`;
}

export default function SettingsClient() {
  const [summaries, setSummaries] = useState<BucketSummary[] | null>(null);
  const [confirming, setConfirming] = useState<BucketKey | "all" | null>(null);
  const [importMode, setImportMode] = useState<"merge" | "replace">("merge");
  const [toast, setToast] = useState<Toast>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  function refresh() {
    setSummaries(summarizeBuckets());
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    refresh();
  }, []);

  // Auto-dismiss toast
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 4000);
    return () => clearTimeout(t);
  }, [toast]);

  function handleExport() {
    try {
      downloadBackup();
      setToast({ kind: "success", text: "הקובץ הורד." });
    } catch {
      setToast({ kind: "error", text: "ייצוא נכשל." });
    }
  }

  function handlePickImport() {
    fileRef.current?.click();
  }

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = ""; // allow re-importing the same file later
    if (!file) return;
    const text = await file.text();
    const result: ImportResult = importAll(text, { merge: importMode === "merge" });
    if (result.ok) {
      setToast({
        kind: "success",
        text: `יובאו ${result.imported} פריטים${result.skipped ? ` · דולגו ${result.skipped}` : ""}.`,
      });
      refresh();
    } else {
      setToast({ kind: "error", text: result.error ?? "ייבוא נכשל." });
    }
  }

  function handleClear(bucket: BucketKey | "all") {
    if (bucket === "all") clearAll();
    else clearBucket(bucket);
    setConfirming(null);
    refresh();
    setToast({ kind: "success", text: "ההגדרה אופסה." });
  }

  return (
    <PageShell>
      <SectionHead
        eyebrow="הגדרות"
        title="גיבוי, ייבוא ואיפוס"
        subtitle="כל הנתונים נשמרים בדפדפן שלך בלבד. גבה אותם מדי פעם אם אתה מתכוון להתחלף בין מכשירים — או לפני שמנקים את הדפדפן."
      />

      {/* Backup & restore */}
      <section className="w-full flex flex-col gap-4">
        <h2 className="th-section-h">גיבוי ושחזור</h2>

        <div className="p-4 rounded-[var(--th-radius-lg)] bg-[var(--th-card)] border border-[var(--th-border)] flex flex-col gap-3">
          <div className="flex flex-wrap items-start gap-3 justify-between">
            <div className="flex flex-col gap-1 min-w-0 flex-1">
              <span className="font-bold text-[var(--th-fg)]">ייצוא לקובץ</span>
              <span className="text-sm text-[var(--th-muted)]">
                שומר את כל ההתקדמות כקובץ JSON להורדה.
              </span>
            </div>
            <button
              type="button"
              onClick={handleExport}
              className="inline-flex items-center justify-center h-10 px-4 rounded-[var(--th-radius-lg)] bg-[var(--th-accent)] text-white text-sm font-semibold hover:bg-[var(--th-accent-hover)] transition-colors"
            >
              הורד גיבוי
            </button>
          </div>
        </div>

        <div className="p-4 rounded-[var(--th-radius-lg)] bg-[var(--th-card)] border border-[var(--th-border)] flex flex-col gap-3">
          <div className="flex flex-col gap-1">
            <span className="font-bold text-[var(--th-fg)]">ייבוא מקובץ</span>
            <span className="text-sm text-[var(--th-muted)]">
              שחזר התקדמות מקובץ שהורד בעבר.
            </span>
          </div>
          <div className="flex items-center gap-2 bg-[var(--th-muted-bg)] rounded-full p-1 self-start">
            {(
              [
                { value: "merge", label: "מיזוג" },
                { value: "replace", label: "החלפה" },
              ] as const
            ).map((m) => (
              <button
                key={m.value}
                type="button"
                onClick={() => setImportMode(m.value)}
                className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors ${
                  importMode === m.value
                    ? "bg-[var(--th-card)] text-[var(--th-fg)] shadow-sm"
                    : "text-[var(--th-muted)] hover:text-[var(--th-fg)]"
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>
          <span className="text-xs text-[var(--th-muted)] leading-relaxed">
            {importMode === "merge"
              ? "מיזוג: ערכים מהקובץ ידרסו רק מה שמופיע בו. השאר נשמר."
              : "החלפה: כל הנתונים הקיימים יימחקו לפני הייבוא."}
          </span>
          <button
            type="button"
            onClick={handlePickImport}
            className="inline-flex items-center justify-center h-10 px-4 self-start rounded-[var(--th-radius-lg)] border border-[var(--th-border)] text-sm font-medium hover:bg-[var(--th-muted-bg)] transition-colors"
          >
            בחר קובץ…
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="application/json,.json"
            onChange={handleFile}
            className="hidden"
          />
        </div>
      </section>

      {/* Per-bucket data overview + targeted reset */}
      <section className="w-full flex flex-col gap-4">
        <div className="flex items-baseline justify-between">
          <h2 className="th-section-h">הנתונים שלך</h2>
          <span className="text-xs text-[var(--th-muted)]">{summaries?.length ?? 0} קטגוריות</span>
        </div>

        <div className="flex flex-col gap-2">
          {(summaries ?? Array.from({ length: 7 }, () => null)).map((s, i) => {
            if (!s) {
              return (
                <div
                  key={i}
                  className="h-14 rounded-[var(--th-radius-lg)] bg-[var(--th-muted-bg)] animate-pulse"
                />
              );
            }
            const empty = s.count === 0;
            const isConfirming = confirming === s.key;
            return (
              <div
                key={s.key}
                className={`p-3 rounded-[var(--th-radius-lg)] border bg-[var(--th-card)] flex items-center gap-3 ${
                  isConfirming ? "border-[var(--th-error)]" : "border-[var(--th-border)]"
                }`}
              >
                <div className="flex flex-col min-w-0 flex-1">
                  <span className="font-semibold text-sm text-[var(--th-fg)]">{s.label}</span>
                  <span className="text-xs text-[var(--th-muted)] tabular-nums">
                    {empty ? "ריק" : `${s.count} פריטים · ${formatBytes(s.bytes)}`}
                  </span>
                </div>
                {!empty && !isConfirming && (
                  <button
                    type="button"
                    onClick={() => setConfirming(s.key)}
                    className="shrink-0 text-xs px-3 py-1.5 rounded-full border border-[var(--th-border)] text-[var(--th-muted-strong)] hover:border-[var(--th-error)] hover:text-[var(--th-error)] transition-colors"
                  >
                    אפס
                  </button>
                )}
                {isConfirming && (
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => setConfirming(null)}
                      className="text-xs px-3 py-1.5 rounded-full border border-[var(--th-border)] hover:bg-[var(--th-muted-bg)] transition-colors"
                    >
                      ביטול
                    </button>
                    <button
                      type="button"
                      onClick={() => handleClear(s.key)}
                      className="text-xs px-3 py-1.5 rounded-full bg-[var(--th-error)] text-white font-semibold hover:opacity-90 transition-opacity"
                    >
                      מחק
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Nuclear option */}
      <section className="w-full">
        <div
          className={`p-4 rounded-[var(--th-radius-lg)] border-2 border-dashed flex items-center gap-3 ${
            confirming === "all"
              ? "border-[var(--th-error)] bg-[var(--th-error-soft)]/30"
              : "border-[var(--th-border-strong)]"
          }`}
        >
          <div className="flex flex-col min-w-0 flex-1">
            <span className="font-bold text-[var(--th-fg)]">איפוס מלא</span>
            <span className="text-xs text-[var(--th-muted)] leading-relaxed">
              מוחק את כל ההתקדמות, השמורות, הסטטיסטיקות והמבחנים. אין דרך חזרה — גבה לפני.
            </span>
          </div>
          {confirming === "all" ? (
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setConfirming(null)}
                className="text-xs px-3 py-1.5 rounded-full border border-[var(--th-border)] hover:bg-[var(--th-muted-bg)] transition-colors"
              >
                ביטול
              </button>
              <button
                type="button"
                onClick={() => handleClear("all")}
                className="text-xs px-3 py-1.5 rounded-full bg-[var(--th-error)] text-white font-semibold hover:opacity-90 transition-opacity"
              >
                מחק הכל
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setConfirming("all")}
              className="shrink-0 text-xs px-3 py-1.5 rounded-full border border-[var(--th-error)] text-[var(--th-error)] font-semibold hover:bg-[var(--th-error-soft)] transition-colors"
            >
              מחק הכל…
            </button>
          )}
        </div>
      </section>

      {/* Toast */}
      {toast && (
        <div
          role="status"
          aria-live="polite"
          className={`fixed bottom-6 inset-x-4 sm:inset-x-auto sm:end-6 sm:max-w-sm z-50 p-4 rounded-[var(--th-radius-lg)] border shadow-lg text-sm font-medium ${
            toast.kind === "success"
              ? "bg-[var(--th-success-soft)] border-[var(--th-success)] text-[var(--th-success)]"
              : toast.kind === "error"
              ? "bg-[var(--th-error-soft)] border-[var(--th-error)] text-[var(--th-error)]"
              : "bg-[var(--th-card)] border-[var(--th-border)] text-[var(--th-fg)]"
          }`}
        >
          {toast.text}
        </div>
      )}
    </PageShell>
  );
}
