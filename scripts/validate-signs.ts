import { SIGNS } from "../lib/data/signs";

const BATCH = 8;

async function check(url: string): Promise<number> {
  // Wikimedia's Special:FilePath redirects (302) to the actual file on hit, 404 on miss.
  const res = await fetch(url, { method: "HEAD", redirect: "manual" });
  return res.status;
}

async function main() {
  const withImage = SIGNS.filter((s) => s.image);
  const failures: { id: string; name: string; url: string; status: number }[] = [];

  for (let i = 0; i < withImage.length; i += BATCH) {
    const batch = withImage.slice(i, i + BATCH);
    const results = await Promise.all(
      batch.map(async (s) => {
        const status = await check(s.image!).catch(() => 0);
        return { sign: s, status };
      })
    );
    for (const { sign, status } of results) {
      const ok = status >= 200 && status < 400;
      if (!ok) failures.push({ id: sign.id, name: sign.name, url: sign.image!, status });
    }
    process.stdout.write(`checked ${Math.min(i + BATCH, withImage.length)}/${withImage.length}\r`);
  }

  process.stdout.write("\n");
  console.log(`\n${withImage.length - failures.length}/${withImage.length} signs OK`);

  if (failures.length > 0) {
    console.error(`\n${failures.length} broken image(s):`);
    for (const f of failures) {
      console.error(`  [${f.id}] ${f.name}  →  HTTP ${f.status}  ${f.url}`);
    }
    process.exit(1);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
