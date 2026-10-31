// WebKit iPhone audit: routes × devices × themes, plus key flows.
// Usage: node audit.mjs <BASE_URL> <outDir> [quick]
import { webkit, devices } from "playwright";
import fs from "node:fs";
import path from "node:path";

const BASE = process.argv[2] ?? "http://localhost:3001";
const OUT = process.argv[3] ?? "./shots";
const QUICK = process.argv[4] === "quick";
fs.mkdirSync(OUT, { recursive: true });

const ROUTES = [
  ["home", "/", true],
  ["study", "/study", true],
  ["topic", "/study/חוקי התנועה", true],
  ["signs", "/study/תמרורים", true],
  ["drill", "/study/תמרורים?view=drill", false],
  ["exam", "/exam", true],
  ["flashcards", "/flashcards", true],
  ["deck", "/flashcards/בטיחות", false],
  ["review", "/review", true],
  ["review-mistakes", "/review?tab=mistakes", true],
  ["review-saved", "/review?tab=saved", true],
  ["progress", "/progress", true],
  ["daily", "/daily", true],
  ["daily-history", "/daily/history", true],
  ["settings", "/settings", true],
  ["q", "/q/0693", true],
  ["404", "/no-such-page-xyz", true],
];
const DEVICES = QUICK ? ["iPhone 15"] : ["iPhone 15", "iPhone SE", "iPhone 15 Pro Max"];
const IGNORED = /gov\.il|ERR_|status of 404/;

const rows = [];
const browser = await webkit.launch();

async function audit(page) {
  return page.evaluate(() => {
    const issues = [];
    const de = document.documentElement;
    if (de.scrollWidth > innerWidth + 1) issues.push(`overflow ${de.scrollWidth}>${innerWidth}`);
    const small = [];
    for (const el of document.querySelectorAll("a[href],button,input,select,textarea,[role=button],[role=tab]")) {
      const r = el.getBoundingClientRect();
      const cs = getComputedStyle(el);
      if (!r.width || !r.height || cs.visibility === "hidden" || el.closest("[hidden],[aria-hidden=true]")) continue;
      // inline links inside running text are exempt
      if (el.tagName === "A" && cs.display === "inline" && el.parentElement && /P|LI|SPAN/.test(el.parentElement.tagName)) continue;
      if (el.tagName === "INPUT" && (el.type === "checkbox" || el.type === "radio") && el.closest("label")?.getBoundingClientRect().height >= 44) continue;
      if (el.tagName === "INPUT" && el.type === "range") continue;
      if (r.width < 43.5 || r.height < 43.5) small.push(`${el.tagName.toLowerCase()}[${(el.getAttribute("aria-label") || el.textContent || "").trim().slice(0, 24)}] ${Math.round(r.width)}x${Math.round(r.height)}`);
      if (/INPUT|TEXTAREA|SELECT/.test(el.tagName) && !/checkbox|radio|range/.test(el.type) && parseFloat(cs.fontSize) < 16) issues.push(`input font ${cs.fontSize}`);
    }
    if (small.length) issues.push(`small: ${small.slice(0, 6).join("; ")}${small.length > 6 ? ` (+${small.length - 6})` : ""}`);
    const tab = document.querySelector("nav.th-tabbar");
    const tabVisible = !!tab && getComputedStyle(tab).display !== "none" && tab.getBoundingClientRect().height > 0;
    if (!document.querySelector("h1")) issues.push("no h1");
    return { issues, tabVisible };
  });
}

for (const dev of DEVICES) {
  for (const theme of ["light", "dark"]) {
    const ctx = await browser.newContext({ ...devices[dev], locale: "he-IL", colorScheme: theme });
    await ctx.addInitScript((t) => localStorage.setItem("theory-il:theme", t), theme);
    const page = await ctx.newPage();
    const errors = [];
    page.on("console", (m) => m.type() === "error" && !IGNORED.test(m.text()) && errors.push(m.text()));
    page.on("pageerror", (e) => errors.push(String(e)));
    for (const [name, route, wantTab] of ROUTES) {
      errors.length = 0;
      const resp = await page.goto(BASE + encodeURI(route), { waitUntil: "networkidle" });
      await page.waitForTimeout(250);
      const { issues, tabVisible } = await audit(page);
      if (tabVisible !== wantTab) issues.push(`tabbar ${tabVisible ? "shown" : "hidden"}, want ${wantTab ? "shown" : "hidden"}`);
      if (errors.length) issues.push(`console: ${errors.join(" | ").slice(0, 200)}`);
      const file = `${name}-${dev.replace(/ /g, "")}-${theme}.png`;
      await page.screenshot({ path: path.join(OUT, file) });
      rows.push({ dev, theme, route, status: resp?.status(), issues, file });
      console.log(issues.length ? "✗" : "✓", dev, theme, route, issues.join(" || "));
    }
    await ctx.close();
  }
}

// Flows on iPhone 15 (light + dark)
for (const theme of ["light", "dark"]) {
  const ctx = await browser.newContext({ ...devices["iPhone 15"], locale: "he-IL", colorScheme: theme });
  await ctx.addInitScript((t) => localStorage.setItem("theory-il:theme", t), theme);
  const page = await ctx.newPage();
  const errors = [];
  page.on("console", (m) => m.type() === "error" && !IGNORED.test(m.text()) && errors.push(m.text()));
  page.on("pageerror", (e) => errors.push(String(e)));
  const flow = async (name, fn) => {
    errors.length = 0;
    try {
      await fn();
      const issues = errors.length ? [`console: ${errors.join(" | ").slice(0, 200)}`] : [];
      rows.push({ dev: "iPhone 15", theme, route: `flow:${name}`, issues });
      console.log(issues.length ? "✗" : "✓", "flow", theme, name, issues.join(""));
    } catch (e) {
      rows.push({ dev: "iPhone 15", theme, route: `flow:${name}`, issues: [String(e).slice(0, 300)] });
      console.log("✗ flow", theme, name, String(e).slice(0, 300));
      await page.screenshot({ path: path.join(OUT, `FAIL-${name}-${theme}.png`) });
    }
  };

  await flow("drill-explanation", async () => {
    await page.goto(BASE + encodeURI("/study/בטיחות?view=drill"), { waitUntil: "networkidle" });
    await page.locator("main button", { hasText: /^א/ }).first().click();
    await page.getByRole("status").filter({ hasText: /נכון/ }).first().waitFor({ timeout: 4000 });
    await page.waitForTimeout(600);
    const expl = await page.getByText(/הסבר/).count();
    await page.screenshot({ path: path.join(OUT, `flow-drill-answered-${theme}.png`), fullPage: true });
    if (!expl) throw new Error("no explanation shown after answering");
  });

  await flow("exam-submit-results", async () => {
    await page.goto(BASE + "/exam", { waitUntil: "networkidle" });
    await page.getByRole("button", { name: /התחל/ }).last().click();
    await page.waitForTimeout(400);
    const tab = await page.locator("nav.th-tabbar").isVisible();
    if (tab) throw new Error("tab bar visible in running exam");
    const radios = page.locator("main [role=radio], main button[aria-pressed], main [role=radiogroup] button");
    await radios.first().click();
    await page.screenshot({ path: path.join(OUT, `flow-exam-${theme}.png`) });
    await page.getByRole("button", { name: /^(הגשה|סיים מבחן)$/ }).first().click();
    await page.getByRole("dialog").waitFor({ timeout: 3000 });
    await page.waitForTimeout(700);
    const box = await page.getByRole("dialog").boundingBox();
    if (!box || box.y + box.height > page.viewportSize().height + 1) throw new Error("confirm sheet off-screen " + JSON.stringify(box));
    const txt = await page.getByRole("dialog").innerText();
    await page.screenshot({ path: path.join(OUT, `flow-exam-confirm-${theme}.png`) });
    if (/\b1 שאלות/.test(txt)) throw new Error("plural with 1: " + txt);
    await page.getByRole("button", { name: /סיים בכל זאת/ }).click();
    await page.waitForURL(/\/results\//, { timeout: 8000 });
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(400);
    const { issues } = await audit(page);
    await page.screenshot({ path: path.join(OUT, `flow-results-${theme}.png`) });
    if (issues.length) throw new Error("results: " + issues.join(" || "));
  });

  await flow("flashcards", async () => {
    await page.goto(BASE + encodeURI("/flashcards/בטיחות"), { waitUntil: "networkidle" });
    await page.locator("main").getByRole("button").filter({ hasText: /הצג|הפוך|תשובה/ }).first().click();
    await page.waitForTimeout(500);
    await page.screenshot({ path: path.join(OUT, `flow-flashcards-flipped-${theme}.png`) });
  });

  await flow("search", async () => {
    await page.goto(BASE + "/", { waitUntil: "networkidle" });
    await page.getByRole("button", { name: /חיפוש/ }).first().click();
    const input = page.locator("input[type=search]:visible").first();
    await input.fill("תמרור");
    await page.waitForTimeout(600);
    const fs16 = await input.evaluate((el) => getComputedStyle(el).fontSize);
    await page.screenshot({ path: path.join(OUT, `flow-search-${theme}.png`) });
    if (parseFloat(fs16) < 16) throw new Error("search input font " + fs16);
  });

  await ctx.close();
}

// PWA assets
const ctx = await browser.newContext();
const r = await ctx.request.get(BASE + "/manifest.webmanifest");
const a = await ctx.request.get(BASE + "/apple-icon");
const html = await (await ctx.request.get(BASE + "/")).text();
const pwa = {
  manifest: r.status(),
  appleIcon: a.status(),
  appleLink: /rel="apple-touch-icon"/.test(html),
  viewportFit: /viewport-fit=cover/.test(html),
};
console.log("PWA", JSON.stringify(pwa));
rows.push({ route: "pwa", issues: pwa.manifest === 200 && pwa.appleIcon === 200 && pwa.appleLink ? [] : [JSON.stringify(pwa)] });

// Desktop parity screenshots
const dctx = await browser.newContext({ viewport: { width: 1280, height: 800 }, locale: "he-IL" });
const dp = await dctx.newPage();
for (const [name, route] of [["home", "/"], ["drill", "/study/תמרורים?view=drill"], ["exam", "/exam"], ["progress", "/progress"]]) {
  await dp.goto(BASE + encodeURI(route), { waitUntil: "networkidle" });
  const ov = await dp.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1);
  await dp.screenshot({ path: path.join(OUT, `desktop-${name}.png`) });
  rows.push({ dev: "desktop 1280", route, issues: ov ? ["overflow"] : [] });
  console.log(ov ? "✗" : "✓", "desktop", route);
}

await browser.close();
fs.writeFileSync(path.join(OUT, "audit.json"), JSON.stringify(rows, null, 1));
const bad = rows.filter((r) => r.issues.length);
console.log(`\n${rows.length - bad.length}/${rows.length} clean`);
