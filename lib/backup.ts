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
  | "srs"
  | "daily";

interface BucketEntry {
  prefix: string;
  /** True if this entry can have multiple keys under the prefix. */
  multi?: boolean;
}

interface BucketSpec {
  key: BucketKey;
  label: string;
  /** All localStorage prefixes that belong to this logical bucket. */
  entries: BucketEntry[];
}

const BUCKETS: BucketSpec[] = [
  { key: "attempts", label: "מבחנים שמורים", entries: [{ prefix: "theory-il:attempt:", multi: true }] },
  { key: "qstats", label: "סטטיסטיקת שאלות", entries: [{ prefix: "theory-il:qstats" }] },
  { key: "streak", label: "רצף ימים", entries: [{ prefix: "theory-il:streak" }] },
  { key: "bookmarks", label: "שאלות שמורות (כוכב)", entries: [{ prefix: "theory-il:bookmarks" }] },
  {
    key: "drillPos",
    label: "מיקום אחרון בלימוד",
    entries: [{ prefix: "theory-il:drillPos" }, { prefix: "theory-il:lastDrill" }],
  },
  { key: "knownSigns", label: "תמרורים שסומנו כמוכרים", entries: [{ prefix: "theory-il:signsKnown" }] },
  { key: "srs", label: "כרטיסיות SRS", entries: [{ prefix: "theory-il:srs" }] },
  {
    key: "daily",
    label: "אתגר יומי",
    entries: [{ prefix: "theory-il:dailyChallenge" }, { prefix: "theory-il:dailyHistory" }],
  },
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

function entryMatches(entry: BucketEntry, k: string): boolean {
  return entry.multi ? k.startsWith(entry.prefix) : k === entry.prefix;
}

function collectKeys(spec: BucketSpec): string[] {
  const out: string[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i);
    if (!k) continue;
    if (spec.entries.some((e) => entryMatches(e, k))) out.push(k);
  }
  return out;
}

export function summarizeBuckets(): BucketSummary[] {
  if (typeof window === "undefined") {
    return BUCKETS.map((b) => ({ key: b.key, label: b.label, count: 0, bytes: 0 }));
  }
  return BUCKETS.map((spec) => {
    let bytes = 0;
    let count = 0;
    for (const entry of spec.entries) {
      const keys: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k && entryMatches(entry, k)) keys.push(k);
      }
      for (const k of keys) {
        const v = localStorage.getItem(k) ?? "";
        bytes += k.length + v.length;
        if (entry.multi) {
          count++;
        } else {
          // For singleton entries count items inside the JSON when sensible.
          try {
            const parsed = JSON.parse(v);
            if (Array.isArray(parsed)) count += parsed.length;
            else if (parsed && typeof parsed === "object") count += Object.keys(parsed).length;
            else count += v ? 1 : 0;
          } catch {
            count += v ? 1 : 0;
          }
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
  const allowedEntries = BUCKETS.flatMap((b) => b.entries);
  const isAllowed = (k: string) => allowedEntries.some((e) => entryMatches(e, k));

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
