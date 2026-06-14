// Centralized export/import for all theory-il localStorage data.
// Adding a new storage key? Register it in BUCKETS so it's exported, imported,
// counted, and resettable from /settings without extra wiring.

export type BucketKey =
  | "attempts"
  | "qstats"
  | "streak"
  | "bookmarks"
  | "drillPos"
  | "knownSigns"
  | "srs";

interface BucketSpec {
  key: BucketKey;
  label: string;
  /** localStorage key prefix; an empty `suffix` means an exact match. */
  storagePrefix: string;
  /** True if this bucket can have multiple localStorage keys under the prefix. */
  multi?: boolean;
}

const BUCKETS: BucketSpec[] = [
  { key: "attempts", label: "מבחנים שמורים", storagePrefix: "theory-il:attempt:", multi: true },
  { key: "qstats", label: "סטטיסטיקת שאלות", storagePrefix: "theory-il:qstats" },
  { key: "streak", label: "רצף ימים", storagePrefix: "theory-il:streak" },
  { key: "bookmarks", label: "שאלות שמורות (כוכב)", storagePrefix: "theory-il:bookmarks" },
  { key: "drillPos", label: "מיקום אחרון בלימוד", storagePrefix: "theory-il:drillPos" },
  { key: "knownSigns", label: "תמרורים שסומנו כמוכרים", storagePrefix: "theory-il:signsKnown" },
  { key: "srs", label: "כרטיסיות SRS", storagePrefix: "theory-il:srs" },
];

export interface BucketSummary {
  key: BucketKey;
  label: string;
  count: number;
  bytes: number;
}

const BACKUP_VERSION = 1;

export interface BackupPayload {
  version: number;
  exportedAt: string;
  data: Record<string, string>;
}

function collectKeys(spec: BucketSpec): string[] {
  const out: string[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i);
    if (!k) continue;
    if (spec.multi ? k.startsWith(spec.storagePrefix) : k === spec.storagePrefix) {
      out.push(k);
    }
  }
  return out;
}

export function summarizeBuckets(): BucketSummary[] {
  if (typeof window === "undefined") {
    return BUCKETS.map((b) => ({ key: b.key, label: b.label, count: 0, bytes: 0 }));
  }
  return BUCKETS.map((spec) => {
    const keys = collectKeys(spec);
    let bytes = 0;
    let count = 0;
    for (const k of keys) {
      const v = localStorage.getItem(k) ?? "";
      bytes += k.length + v.length;
      if (spec.multi) {
        count++;
      } else {
        // For singleton buckets we count entries inside the JSON when sensible.
        try {
          const parsed = JSON.parse(v);
          if (Array.isArray(parsed)) count = parsed.length;
          else if (parsed && typeof parsed === "object") count = Object.keys(parsed).length;
          else count = v ? 1 : 0;
        } catch {
          count = v ? 1 : 0;
        }
      }
    }
    return { key: spec.key, label: spec.label, count, bytes };
  });
}

export function exportAll(): BackupPayload {
  const data: Record<string, string> = {};
  for (const spec of BUCKETS) {
    for (const k of collectKeys(spec)) {
      const v = localStorage.getItem(k);
      if (v !== null) data[k] = v;
    }
  }
  return {
    version: BACKUP_VERSION,
    exportedAt: new Date().toISOString(),
    data,
  };
}

export interface ImportResult {
  ok: boolean;
  imported: number;
  skipped: number;
  error?: string;
}

export function importAll(raw: string, opts: { merge?: boolean } = {}): ImportResult {
  let payload: BackupPayload;
  try {
    payload = JSON.parse(raw) as BackupPayload;
  } catch {
    return { ok: false, imported: 0, skipped: 0, error: "קובץ לא חוקי — JSON שגוי" };
  }
  if (!payload || typeof payload !== "object" || !payload.data) {
    return { ok: false, imported: 0, skipped: 0, error: "המבנה של הקובץ לא תואם" };
  }
  if (typeof payload.version !== "number" || payload.version > BACKUP_VERSION) {
    return {
      ok: false,
      imported: 0,
      skipped: 0,
      error: `גרסת קובץ לא נתמכת (${payload.version})`,
    };
  }

  // Only accept keys belonging to a known bucket — prevents arbitrary writes.
  const allowedPrefixes = BUCKETS.flatMap((b) =>
    b.multi ? [{ prefix: b.storagePrefix, exact: false }] : [{ prefix: b.storagePrefix, exact: true }]
  );
  const isAllowed = (k: string) =>
    allowedPrefixes.some((p) => (p.exact ? k === p.prefix : k.startsWith(p.prefix)));

  if (!opts.merge) {
    // Replace mode: clear all known buckets first
    for (const spec of BUCKETS) {
      for (const k of collectKeys(spec)) localStorage.removeItem(k);
    }
  }

  let imported = 0;
  let skipped = 0;
  for (const [k, v] of Object.entries(payload.data)) {
    if (typeof v !== "string" || !isAllowed(k)) {
      skipped++;
      continue;
    }
    localStorage.setItem(k, v);
    imported++;
  }
  return { ok: true, imported, skipped };
}

export function clearBucket(key: BucketKey): void {
  const spec = BUCKETS.find((b) => b.key === key);
  if (!spec) return;
  for (const k of collectKeys(spec)) localStorage.removeItem(k);
}

export function clearAll(): void {
  for (const spec of BUCKETS) {
    for (const k of collectKeys(spec)) localStorage.removeItem(k);
  }
}

export function downloadBackup(): void {
  const payload = exportAll();
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const date = new Date().toISOString().slice(0, 10);
  const a = document.createElement("a");
  a.href = url;
  a.download = `theory-il-backup-${date}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
