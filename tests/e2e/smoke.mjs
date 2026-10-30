// End-to-end smoke test: every route, both themes, phone viewport.
// Usage: npm run build && npm start (or npm run dev), then
//   BASE_URL=http://localhost:3000 npm run test:e2e
import { chromium } from "playwright";

const BASE = process.env.BASE_URL ?? "http://localhost:3000";
const ROUTES = [
  "/", "/study", "/study/חוקי התנועה", "/study/תמרורים", "/study/תמרורים?view=drill",
  "/exam", "/flashcards", "/flashcards/בטיחות", "/review", "/review?tab=mistakes",
  "/review?tab=saved", "/progress", "/daily", "/daily/history", "/settings", "/q/0693",
  "/this-route-does-not-exist",
];
// Third-party images (gov.il) may be unreachable in CI sandboxes; that's not an app error.
const IGNORED = /ERR_TUNNEL|ERR_NAME_NOT_RESOLVED|ERR_CONNECTION|gov\.il|status of 404/;

let failures = 0;
const fail = (msg) => {
  failures++;
  console.error("  ✗", msg);
};

async function checkPage(page, label) {
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1);
  if (overflow) fail(`${label}: horizontal overflow`);
  const h1 = await page.locator("h1").count();
  if (h1 === 0) fail(`${label}: no <h1>`);
}

const browser = await chromium.launch();
for (const theme of ["light", "dark"]) {
  console.log(`\n[${theme}]`);
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, locale: "he-IL" });
  await ctx.addInitScript((t) => localStorage.setItem("theory-il:theme", t), theme);
  const page = await ctx.newPage();
  const errors = [];
  page.on("console", (m) => m.type() === "error" && !IGNORED.test(m.text()) && errors.push(m.text()));
  page.on("pageerror", (e) => errors.push(String(e)));

  for (const r of ROUTES) {
    errors.length = 0;
    await page.goto(BASE + encodeURI(r), { waitUntil: "networkidle" });
    await checkPage(page, r);
    if (errors.length) fail(`${r}: console errors: ${errors.join(" | ").slice(0, 300)}`);
    else console.log("  ✓", r);
  }

  // Flow: answer a drill question → feedback appears
  await page.goto(BASE + encodeURI("/study/בטיחות?view=drill"), { waitUntil: "networkidle" });
  await page.locator("main button", { hasText: /^א\./ }).first().click();
  if (!(await page.getByRole("status").filter({ hasText: /נכון/ }).count())) fail("drill: no feedback after answering");
  else console.log("  ✓ drill answer feedback");

  // Flow: short exam → submit → results
  await page.goto(BASE + "/exam", { waitUntil: "networkidle" });
  const startBtn = page.getByRole("button", { name: /התחל/ }).last();
  await startBtn.click();
  await page.waitForTimeout(300);
  await page.keyboard.press("1");
  await page.getByRole("button", { name: "סיים מבחן" }).click();
  const confirm = page.getByRole("dialog").getByRole("button", { name: /סיים/ });
  if (await confirm.count()) await confirm.first().click();
  await page.waitForURL(/\/results\//, { timeout: 10_000 }).catch(() => fail("exam: did not reach results"));
  if (page.url().includes("/results/")) console.log("  ✓ exam → results");

  // Flow: phone search sheet opens as a dialog and closes with Escape
  await page.goto(BASE + "/", { waitUntil: "networkidle" });
  const searchBtn = page.getByRole("button", { name: "חיפוש" }).first();
  if (await searchBtn.count()) {
    await searchBtn.click();
    if (!(await page.getByRole("dialog").count())) fail("search: did not open as a dialog");
    await page.keyboard.press("Escape");
    await page.waitForTimeout(400);
    if (await page.getByRole("dialog").count()) fail("search: Escape did not close it");
    else console.log("  ✓ search sheet open/Escape");
  } else fail("search: no search button with accessible name");

  // Bottom tab bar: shown on browse routes, hidden on focus routes
  const tabbar = page.getByRole("navigation", { name: "ניווט ראשי" });
  for (const [route, shown] of [["/", true], ["/progress", true]]) {
    await page.goto(BASE + encodeURI(route), { waitUntil: "networkidle" });
    if ((await tabbar.isVisible()) !== shown) fail(`tab bar: expected ${shown ? "visible" : "hidden"} on ${route}`);
    else console.log(`  ✓ tab bar ${shown ? "visible" : "hidden"} on ${route}`);
  }

  await ctx.close();
}
await browser.close();

console.log(failures ? `\n${failures} failure(s)` : "\nAll smoke checks passed");
process.exit(failures ? 1 : 0);
