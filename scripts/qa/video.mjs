// Recorrido guionizado de ~40 s para el vídeo de candidatura (sin audio: Playwright no lo graba).
import { chromium } from "playwright-core";
import fs from "node:fs"; import path from "node:path";
const outDir = process.argv[2] || path.join(import.meta.dirname, "..", "..", "presentation");
fs.mkdirSync(path.join(import.meta.dirname, "shots"), { recursive: true }); const tmp = path.join(import.meta.dirname, "video-tmp");
fs.rmSync(tmp, { recursive: true, force: true });
const W = 1280, H = 720;
const browser = await chromium.launch({ channel: "chrome", headless: true, args: ["--enable-gpu", "--use-angle=d3d11", "--ignore-gpu-blocklist"] });
const context = await browser.newContext({ viewport: { width: W, height: H }, deviceScaleFactor: 1, recordVideo: { dir: tmp, size: { width: W, height: H } } });
const page = await context.newPage();
const wait = (ms) => page.waitForTimeout(ms);
const wheel = async (total, ms) => { const start = Date.now(); let done = 0; for (;;) { const t = Math.min(1, (Date.now() - start) / ms); const target = total * t; await page.mouse.wheel(0, target - done); done = target; if (t >= 1) break; await wait(8); } };
const proof = (name) => page.screenshot({ path: path.join(import.meta.dirname, "shots", "video-" + name + ".png") });
const top = (sel) => page.evaluate((s) => document.querySelector(s).getBoundingClientRect().top, sel);
const t0 = Date.now();

await page.goto("http://localhost:4173/", { waitUntil: "domcontentloaded" });
await page.mouse.move(W * 0.7, H * 0.5);
await wait(3000);
const btn = await page.getByRole("button", { name: "Encender el telescreen" }).boundingBox();
await page.mouse.move(btn.x + 160, btn.y + btn.height / 2, { steps: 25 });
await wait(350);
await page.mouse.down(); await page.mouse.up();
await wait(2300);
// El cartel sigue al cursor
await page.mouse.move(W * 0.88, H * 0.22, { steps: 30 });
await wait(450);
await page.mouse.move(W * 0.12, H * 0.3, { steps: 36 });
await wait(400);
await page.mouse.move(W * 0.5, H * 0.8, { steps: 24 });
await wait(350);
// Morph hasta la ciudad
await wheel(H * 1.5, 4600);
await wait(1300);
// Diario
await wheel((await top("#escena-2")) - H * 0.02, 1500);
await wait(500);
const diary = await page.locator("#diary").boundingBox();
await page.mouse.move(diary.x + 60, diary.y + 24, { steps: 20 });
await page.mouse.down(); await page.mouse.up();
await page.keyboard.type("Abajo el Hermano Mayor", { delay: 55 });
await wait(350);
await page.keyboard.press("Enter");
await wait(1400);
await proof("sello");
// Doblepiensa
await wheel(await top("#escena-3"), 1500);
await wait(700);
const sw = await page.getByRole("switch").boundingBox();
await page.mouse.move(sw.x + sw.width / 2, sw.y + sw.height / 2, { steps: 25 });
await wait(250);
await page.mouse.down(); await page.mouse.up();
await wait(1900);
// Agujero de la memoria
await wheel((await top(".memory-hole")) - H * 0.55, 1400);
await wait(500);
const word = await page.locator(".hole-word", { hasText: "Withers" }).boundingBox();
const hole = await page.locator(".memory-hole").boundingBox();
await page.mouse.move(word.x + word.width / 2, word.y + word.height / 2, { steps: 20 });
await page.mouse.down();
await page.mouse.move(hole.x + hole.width / 2, hole.y + hole.height / 2, { steps: 45 });
await wait(150);
await proof("arrastre");
await page.mouse.up();
await wait(1700);
// Archivo
await page.locator('nav[aria-label="Escenas"] a').last().click();
await page.mouse.move(W * 0.55, H * 0.6, { steps: 15 });
await wait(2900);
// El giro
const tw = await page.evaluate(() => document.querySelector("#escena-5 .sticky").parentElement.getBoundingClientRect().top);
await wheel(tw + H * 0.15, 1800);
await proof("giro-1");
await wheel(H * 1.2, 5000);
await wait(1700);
await proof("giro-2");

console.log("duración", ((Date.now() - t0) / 1000).toFixed(1), "s");
await context.close();
const file = fs.readdirSync(tmp).find((f) => f.endsWith(".webm"));
fs.mkdirSync(outDir, { recursive: true });
const dest = path.join(outDir, "telescreen-recorrido.webm");
fs.copyFileSync(path.join(tmp, file), dest);
console.log("vídeo", dest, (fs.statSync(dest).size / 1048576).toFixed(1), "MB");
await browser.close();
