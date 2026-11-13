// Recorrido completo con capturas. Uso: node scripts/qa/shots.mjs [desktop|mobile|calm] [filtro]
// QS="?sin-webgl" fuerza el modo sin WebGL; TAG cambia el prefijo de los archivos.
// Requiere Chrome instalado y el export servido en http://localhost:4173 (npm run preview).
import { chromium } from "playwright-core";
import fs from "node:fs";
import path from "node:path";

const out = path.join(import.meta.dirname, "shots");
fs.mkdirSync(out, { recursive: true });
const mode = process.argv[2] || "desktop";
const tag = process.env.TAG || mode;
const only = process.argv[3] || "";
const base = "http://localhost:4173/";

const presets = {
  desktop: { viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 },
  mobile: { viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true },
  calm: { viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1, reducedMotion: "reduce" },
};

const browser = await chromium.launch({
  channel: "chrome",
  headless: true,
  args: ["--enable-unsafe-swiftshader", "--use-angle=swiftshader", "--ignore-gpu-blocklist"],
});
const context = await browser.newContext(presets[mode]);
const page = await context.newPage();
const errors = [];
page.on("console", (m) => { if (m.type() === "error" || m.type() === "warning") errors.push(`[${m.type()}] ${m.text()}`); });
page.on("pageerror", (e) => errors.push(`[pageerror] ${e.message}`));
page.on("response", (r) => { if (r.status() >= 400) errors.push(`[http ${r.status()}] ${r.url()}`); });
page.on("requestfailed", (r) => errors.push(`[requestfailed] ${r.url()}`));
const external = new Set();
page.on("request", (r) => { if (!r.url().startsWith(base) && !r.url().startsWith("data:") && !r.url().startsWith("blob:")) external.add(r.url()); });

const shot = async (name) => { if (!only || name.includes(only)) await page.screenshot({ path: path.join(out, `${tag}-${name}.png`) }); };
const wait = (ms) => page.waitForTimeout(ms);
const scrollTo = async (y) => { await page.evaluate((v) => window.scrollTo(0, v), y); await wait(1100); };
const top = (sel) => page.evaluate((s) => document.querySelector(s).getBoundingClientRect().top + window.scrollY, sel);

await page.goto(base + (process.env.QS || ""), { waitUntil: "networkidle" });
await wait(600);
await shot("00a-boot");
await wait(2600);
await shot("00b-ready");

await page.getByRole("button", { name: "Encender sin sonido" }).click();
await wait(700);
await shot("01a-intro");
await wait(2200);
if (mode === "desktop") await page.mouse.move(1100, 300);
await wait(900);
await shot("01b-poster");
if (mode === "desktop") { await page.mouse.move(200, 700); await wait(900); await shot("01c-gaze"); }

const vh = presets[mode].viewport.height;
const pinned = await page.evaluate(() => !!document.querySelector("#escena-1 .sticky"));
if (pinned) {
  for (const [i, f] of [0.35, 0.6, 0.85, 1.2, 1.5].entries()) { await scrollTo(vh * f); await shot(`01d-morph${i}`); }
} else {
  await scrollTo(vh * 1.0); await shot("01d-simple");
}

// 02
await scrollTo((await top("#escena-2")) - vh * 0.05);
await shot("02a-diary");
await page.locator("#diary").click();
await page.keyboard.type("Abajo el Hermano Mayor", { delay: 30 });
await wait(400);
await shot("02b-typing");
await wait(3600);
await shot("02c-sealed");

// 03
await scrollTo((await top("#escena-3")) + 10);
await wait(600);
await shot("03a-truth");
await page.getByRole("switch").click();
await wait(450);
await shot("03b-wipe");
await wait(1600);
await shot("03c-other-truth");
const holeTop = await page.evaluate(() => document.querySelector(".memory-hole").getBoundingClientRect().top + window.scrollY);
await scrollTo(holeTop - vh * 0.6);
await wait(4200);
await shot("03d-hole");
if (mode === "desktop") {
  const word = page.locator(".hole-word", { hasText: "Withers" });
  const wb = await word.boundingBox(); const hb = await page.locator(".memory-hole").boundingBox();
  await page.mouse.move(wb.x + wb.width / 2, wb.y + wb.height / 2);
  await page.mouse.down();
  await page.mouse.move(hb.x + hb.width / 2, hb.y + hb.height / 2, { steps: 12 });
  await shot("03e-dragging");
  await page.mouse.up();
} else {
  await page.locator(".hole-word", { hasText: "Withers" }).focus();
  await page.keyboard.press("Enter");
}
await wait(2200);
await shot("03f-burned");

// 04
await scrollTo((await top("#escena-4")) + vh * 0.16);
await wait(700);
await shot("04a-room");
await page.getByRole("button", { name: "las ratas" }).click();
await wait(500);
await shot("04b-noted");

// 05
await scrollTo((await top("#escena-5")) + 20);
await wait(2600);
await shot("05a-report");
await scrollTo((await top("#escena-5")) + vh * 0.7);
await shot("05b-report2");
if (pinned) {
  const tw = await page.evaluate(() => { const s = document.querySelector("#escena-5 .sticky").parentElement; return s.getBoundingClientRect().top + window.scrollY; });
  for (const [i, f] of [0.25, 0.6, 0.95, 1.3].entries()) { await scrollTo(tw + vh * f); await shot(`05c-twist${i}`); }
}
await scrollTo(await page.evaluate(() => document.documentElement.scrollHeight));
await shot("05d-end");

await page.emulateMedia({ media: "print" });
await page.screenshot({ path: path.join(out, `${mode}-06-print.png`), fullPage: true });

console.log("external requests:", [...external]);
console.log(errors.length ? errors.join("\n") : "console clean");
await browser.close();
