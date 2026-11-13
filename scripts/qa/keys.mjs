// Recorrido solo con teclado y con sonido activado. Comprueba foco, estados y detalles de autor.
// Requiere Chrome instalado y el export servido en http://localhost:4173 (npm run preview).
import { chromium } from "playwright-core";
import fs from "node:fs";
import path from "node:path";

const out = path.join(import.meta.dirname, "shots");
fs.mkdirSync(out, { recursive: true });
const base = "http://localhost:4173/";
const browser = await chromium.launch({
  channel: "chrome",
  headless: true,
  args: ["--enable-unsafe-swiftshader", "--use-angle=swiftshader", "--ignore-gpu-blocklist", "--autoplay-policy=user-gesture-required"],
});
const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
const page = await context.newPage();
const errors = [];
page.on("console", (m) => { if (m.type() === "error" || m.type() === "warning") errors.push(`[${m.type()}] ${m.text()}`); });
page.on("pageerror", (e) => errors.push(`[pageerror] ${e.message}`));
const results = [];
const check = (name, ok, extra = "") => results.push(`${ok ? "PASS" : "FAIL"}  ${name}${extra ? "  — " + extra : ""}`);
const wait = (ms) => page.waitForTimeout(ms);
const active = () => page.evaluate(() => { const e = document.activeElement; return e ? `${e.tagName}#${e.id}|${(e.textContent || "").trim().slice(0, 40)}` : ""; });

await page.addInitScript(() => {
  // Espía: ¿se crea un AudioContext antes de cualquier gesto?
  window.__audioContexts = 0;
  const Original = window.AudioContext;
  window.AudioContext = class extends Original { constructor(...a) { super(...a); window.__audioContexts += 1; window.__ctx = this; } };
});

await page.goto(base, { waitUntil: "networkidle" });
check("sin AudioContext antes del gesto", (await page.evaluate(() => window.__audioContexts)) === 0);
check("scroll bloqueado durante la calibración", await page.evaluate(() => document.documentElement.classList.contains("is-locked")));
check("main inerte durante la calibración", await page.evaluate(() => document.getElementById("experiencia").inert === true));
check("título inicial", (await page.title()).startsWith("TELESCREEN"));

await page.keyboard.press("Tab");
check("primer foco = saltar introducción", (await active()).includes("Saltar la introducción"), await active());
await page.keyboard.press("Tab");
check("segundo foco = encender", (await active()).includes("Encender el telescreen"), await active());
await page.keyboard.press("Enter");
await wait(1200);
check("AudioContext creado tras el gesto", (await page.evaluate(() => window.__audioContexts)) === 1);
check("audio en marcha", (await page.evaluate(() => window.__ctx?.state)) === "running");
check("foco en el titular de la escena 01", (await active()).startsWith("H1#h-1"), await active());
check("título de la escena 01", (await page.title()).includes("Hermano Mayor"), await page.title());
check("botón de sonido visible y pulsado", (await page.getByRole("button", { name: "Sonido del telescreen" }).getAttribute("aria-pressed")) === "true");

// Índice lateral con teclado → escena 02
await page.keyboard.press("Tab"); // primer control dentro de main o HUD
const order = [];
for (let i = 0; i < 8; i++) { order.push(await active()); await page.keyboard.press("Tab"); }
check("orden de tabulación alcanza el diario", order.some((o) => o.includes("TEXTAREA#diary")), order.join(" > "));

await page.locator("#diary").focus();
await wait(900);
check("escena activa 02 al enfocar el diario", (await page.title()).includes("Escriba"), await page.title());
await page.keyboard.type("Dos y dos son cuatro", { delay: 25 });
await page.keyboard.press("Enter");
await wait(900);
check("sello tras Enter", await page.locator(".stamp").first().isVisible());
check("diario de solo lectura tras el sello", await page.locator("#diary").evaluate((e) => e.readOnly));

// Interruptor con teclado
await page.getByRole("switch").focus();
await page.keyboard.press("Space");
await wait(1700);
check("interruptor marcado", (await page.getByRole("switch").getAttribute("aria-checked")) === "true");
check("2 + 2 = 5", (await page.locator("#escena-3").innerText()).includes("5"));
check("enemigo reescrito", (await page.locator("#h-3 .sr-only").textContent()).includes("Asia Oriental"));

// Agujero de la memoria con teclado (tres palabras)
for (const word of ["Withers", "medalla", "Ayer"]) {
  await page.locator(".hole-word", { hasText: word }).focus();
  await page.keyboard.press("Enter");
  await wait(1700);
}
const sentence = await page.locator(".sentence-in").innerText();
check("frase final del agujero", sentence.includes("Nunca ocurrió nada"), sentence);
check("teletipo en rojo", await page.locator(".ticker.is-hot").count() === 1);

// Habitación 101: escribir, borrar, declinar
await page.locator("#fear").focus();
await page.keyboard.type("el silencio");
await page.keyboard.press("Enter");
await wait(400);
check("miedo anotado", (await page.locator("#escena-4").innerText()).includes("el silencio"));
await page.getByRole("button", { name: "Borrar lo que he dicho" }).press("Enter");
await wait(300);
check("miedo borrado del estado", (await page.locator("#escena-4").innerText()).includes("Borrado"));
await page.getByRole("button", { name: "las ratas" }).press("Enter");
await wait(300);
check("salida visible", await page.getByRole("link", { name: "Salir de la habitación" }).isVisible());
await page.getByRole("link", { name: "Salir de la habitación" }).press("Enter");
await wait(3200);
check("foco en el expediente", (await active()).startsWith("H2#h-5"), await active());
const report = await page.locator("#escena-5 dl").innerText();
check("expediente con la frase del diario", report.includes("Dos y dos son cuatro"));
check("expediente con el miedo", report.includes("las ratas"));
check("bytes enviados = 0", /Bytes enviados\s+0/i.test(report), report.slice(-60).replace(/\n/g, " "));

// Detalles de autor: cambio de pestaña e inactividad
await page.evaluate(() => {
  Object.defineProperty(document, "hidden", { configurable: true, get: () => true });
  document.dispatchEvent(new Event("visibilitychange"));
});
check("título al ocultar la pestaña", (await page.title()) === "Vuelva a la pantalla.", await page.title());
check("audio suspendido al ocultar", (await page.evaluate(() => new Promise((r) => setTimeout(() => r(window.__ctx.state), 300)))) === "suspended");
await page.evaluate(() => {
  Object.defineProperty(document, "hidden", { configurable: true, get: () => false });
  document.dispatchEvent(new Event("visibilitychange"));
});
await wait(500);
check("nota al volver", (await page.locator(".whisper").innerText()).includes("Eso se anota"));
await wait(20500);
check("mensaje de inactividad a los 20 s", (await page.locator(".whisper").innerText().catch(() => "")).includes("Sigue ahí"));
await page.screenshot({ path: path.join(out, "keys-whisper.png") });

// Silenciar
await page.getByRole("button", { name: "Sonido del telescreen" }).press("Enter");
check("silenciado", (await page.getByRole("button", { name: "Sonido del telescreen" }).getAttribute("aria-pressed")) === "false");

// Almacenamiento: nada persistido
const storage = await page.evaluate(() => ({ ls: localStorage.length, ss: sessionStorage.length, cookies: document.cookie }));
check("sin localStorage / sessionStorage / cookies", storage.ls === 0 && storage.ss === 0 && storage.cookies === "", JSON.stringify(storage));

console.log(results.join("\n"));
console.log(errors.length ? errors.join("\n") : "console clean");
await browser.close();
if (results.some((line) => line.startsWith("FAIL")) || errors.length) process.exit(1);
