import { SIGNS } from "../lib/data/signs";

// Wikimedia requires a descriptive User-Agent and rate-limits anonymous bursts.
// https://meta.wikimedia.org/wiki/User-Agent_policy
const UA = "theory-il-signs-validator/1.0 (https://github.com/DanySued/theory-il)";
const SLEEP_MS = 150;
const RETRIES = 4;

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

async function main() {
  const withImage = SIGNS.filter((s) => s.image);

  // Duplicate detection: same image URL on multiple signs almost always
  // means a wrong number was copied in. Real signs should be 1:1.
  const byImg = new Map<string, { id: string; name: string }[]>();
  for (const s of withImage) {
    const arr = byImg.get(s.image!) ?? [];
    arr.push({ id: s.id, name: s.name });
    byImg.set(s.image!, arr);
  }
  const dups = [...byImg.entries()].filter(([, e]) => e.length > 1);

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
  console.log(`\n${withImage.length - failures.length}/${withImage.length} signs OK`);

  if (dups.length > 0) {
    console.error(`\n${dups.length} duplicate image URL(s) — likely wrong number(s) copied in:`);
    for (const [url, entries] of dups) {
      const n = url.match(/Israel_road_sign_(.+)\.svg/)?.[1] ?? url;
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

  if (failures.length > 0 || dups.length > 0) process.exit(1);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
