// Genera la imagen OG y mide fotogramas durante el morph de la escena 01.
import { chromium } from "playwright-core";
import path from "node:path";

const base = "http://localhost:4173/";
const ogPath = process.argv[2] || path.join(import.meta.dirname, "..", "..", "public", "og", "telescreen.png");

async function open(viewport, args, extra = {}) {
  const browser = await chromium.launch({ channel: "chrome", headless: true, args });
  const context = await browser.newContext({ viewport, deviceScaleFactor: 1, ...extra });
  const page = await context.newPage();
  await page.goto(base, { waitUntil: "networkidle" });
  await page.waitForTimeout(2600);
  await page.getByRole("button", { name: "Encender sin sonido" }).click();
  await page.waitForTimeout(3200);
  return { browser, page };
}

// --- OG 1200×630
{
  const { browser, page } = await open({ width: 1200, height: 630 }, ["--enable-unsafe-swiftshader", "--use-angle=swiftshader"]);
  await page.addStyleTag({ content: ".hud, .cursor-eye, .bb-fade, .whisper { display: none !important; }" });
  await page.mouse.move(600, 600);
  await page.waitForTimeout(1500);
  await page.screenshot({ path: ogPath });
  await browser.close();
  console.log("og written", ogPath);
}

// --- FPS con GPU real (si el modo headless la expone)
for (const [label, viewport, extra] of [
  ["desktop 1440x900 @1x", { width: 1440, height: 900 }, {}],
  ["mobile 390x844 @2x", { width: 390, height: 844 }, { deviceScaleFactor: 2, isMobile: true, hasTouch: true }],
]) {
  const { browser, page } = await open(viewport, ["--enable-gpu", "--use-angle=d3d11", "--ignore-gpu-blocklist"], extra);
  const renderer = await page.evaluate(() => {
    const gl = document.createElement("canvas").getContext("webgl");
    const ext = gl?.getExtension("WEBGL_debug_renderer_info");
    return ext ? gl.getParameter(ext.UNMASKED_RENDERER_WEBGL) : "desconocido";
  });
  const stats = await page.evaluate(
    (vh) =>
      new Promise((resolve) => {
        const deltas = [];
        let last = performance.now();
        const start = last;
        const duration = 6000;
        const frame = (now) => {
          deltas.push(now - last);
          last = now;
          const t = (now - start) / duration;
          // Scroll continuo de ida y vuelta por todo el morph.
          window.scrollTo(0, vh * 1.5 * (0.5 - 0.5 * Math.cos(t * Math.PI * 2)));
          if (now - start < duration) requestAnimationFrame(frame);
          else {
            deltas.shift();
            deltas.sort((a, b) => a - b);
            const avg = deltas.reduce((s, d) => s + d, 0) / deltas.length;
            resolve({
              frames: deltas.length,
              avgFps: +(1000 / avg).toFixed(1),
              p95ms: +deltas[Math.floor(deltas.length * 0.95)].toFixed(1),
              worstMs: +deltas[deltas.length - 1].toFixed(1),
              over33ms: deltas.filter((d) => d > 33.4).length,
            });
          }
        };
        requestAnimationFrame(frame);
      }),
    viewport.height,
  );
  const points = await page.evaluate(() => document.querySelector(".telescreen-canvas canvas") ? "canvas ok" : "sin canvas");
  console.log(label, "|", renderer, "|", points, "|", JSON.stringify(stats));
  await browser.close();
}
