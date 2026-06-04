import { SIGNS } from "../lib/data/signs";
import canonical from "../lib/data/signs-canonical.json";

// Wikimedia requires a descriptive User-Agent and rate-limits anonymous bursts.
// https://meta.wikimedia.org/wiki/User-Agent_policy
const UA = "theory-il-signs-validator/1.0 (https://github.com/DanySued/theory-il)";
const SLEEP_MS = 150;
const RETRIES = 4;

const CANON = canonical as Record<string, string>;

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function check(url: string): Promise<number> {
  for (let attempt = 0; attempt < RETRIES; attempt++) {
    const res = await fetch(url, {
      method: "HEAD",
      redirect: "manual",
      headers: { "User-Agent": UA },
    });
    if (res.status !== 429) return res.status;
    await sleep(2000 * (attempt + 1));
  }
  return 429;
}

function extractNumber(url: string): string | null {
  return url.match(/Israel_road_sign_(.+)\.svg/)?.[1] ?? null;
}

// Hebrew word overlap: tokens of 3+ chars, strip punctuation.
function tokens(s: string): Set<string> {
  return new Set(
    s
      .replace(/[(),.\-/"׳״']/g, " ")
      .split(/\s+/)
      .filter((w) => w.length >= 3)
  );
}

function overlap(a: string, b: string): number {
  const ta = tokens(a);
  const tb = tokens(b);
  let n = 0;
  for (const w of ta) if (tb.has(w)) n++;
  return n;
}

async function main() {
  const withImage = SIGNS.filter((s) => s.image);

  // 1. Duplicate detection
  const byImg = new Map<string, { id: string; name: string }[]>();
  for (const s of withImage) {
    const arr = byImg.get(s.image!) ?? [];
    arr.push({ id: s.id, name: s.name });
    byImg.set(s.image!, arr);
  }
  const dups = [...byImg.entries()].filter(([, e]) => e.length > 1);

  // 2. HEAD-check reachability
  const failures: { id: string; name: string; url: string; status: number }[] = [];
  for (let i = 0; i < withImage.length; i++) {
    const s = withImage[i];
    const status = await check(s.image!).catch(() => 0);
    const ok = status >= 200 && status < 400;
    if (!ok) failures.push({ id: s.id, name: s.name, url: s.image!, status });
    process.stdout.write(`checked ${i + 1}/${withImage.length}\r`);
    if (i + 1 < withImage.length) await sleep(SLEEP_MS);
  }
  process.stdout.write("\n");

  // 3. Canonical semantic check: does the sign number actually represent
  //    what we claim? Hard mismatch = zero word overlap (almost certainly wrong sign).
  //    Soft mismatch = different phrasing but some shared words (review needed).
  const hardMismatches: { id: string; name: string; number: string; canonical: string }[] = [];
  const softMismatches: { id: string; name: string; number: string; canonical: string }[] = [];
  const unknownNumbers: { id: string; name: string; number: string }[] = [];

  for (const s of withImage) {
    const num = extractNumber(s.image!);
    if (!num) continue;
    const canon = CANON[num];
    if (!canon) {
      unknownNumbers.push({ id: s.id, name: s.name, number: num });
      continue;
    }
    const shared = overlap(s.name, canon);
    if (shared === 0) {
      hardMismatches.push({ id: s.id, name: s.name, number: num, canonical: canon });
    } else if (shared < Math.min(tokens(s.name).size, tokens(canon).size)) {
      // partial overlap — informational only
      softMismatches.push({ id: s.id, name: s.name, number: num, canonical: canon });
    }
  }

  // Reports
  console.log(`\n${withImage.length - failures.length}/${withImage.length} signs reachable`);
  console.log(`${withImage.length - hardMismatches.length - unknownNumbers.length}/${withImage.length} signs match canonical`);

  if (dups.length > 0) {
    console.error(`\n${dups.length} duplicate image URL(s):`);
    for (const [url, entries] of dups) {
      const n = extractNumber(url) ?? url;
      console.error(`  #${n} reused by:`);
      for (const e of entries) console.error(`    [${e.id}] ${e.name}`);
    }
  }

  if (failures.length > 0) {
    console.error(`\n${failures.length} broken image(s):`);
    for (const f of failures) {
      console.error(`  [${f.id}] ${f.name}  →  HTTP ${f.status}  ${f.url}`);
    }
  }

  if (hardMismatches.length > 0) {
    // Warn-only: many of these are synonyms vs canonical phrasing rather
    // than wrong signs. Reviewer should triage; CI still fails on 404/dupe.
    console.log(`\n${hardMismatches.length} canonical mismatch(es) — review whether sign is wrong or just phrased differently:`);
    for (const m of hardMismatches) {
      console.log(`  [${m.id}] catalog says "${m.name}" but #${m.number} is canonically "${m.canonical}"`);
    }
  }

  if (softMismatches.length > 0) {
    console.log(`\n${softMismatches.length} soft mismatch(es) (different phrasing, partial overlap — review only):`);
    for (const m of softMismatches) {
      console.log(`  [${m.id}] "${m.name}" vs canonical "${m.canonical}" (#${m.number})`);
    }
  }

  if (unknownNumbers.length > 0) {
    console.log(`\n${unknownNumbers.length} number(s) not in canonical map (can't verify):`);
    for (const u of unknownNumbers) {
      console.log(`  [${u.id}] #${u.number} — ${u.name}`);
    }
  }

  if (failures.length > 0 || dups.length > 0) {
    process.exit(1);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
