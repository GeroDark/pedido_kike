// Fotogramas del morph de la escena 01 en viewport móvil con la CPU frenada ×4 y ×6.
import { chromium } from "playwright-core";
const browser = await chromium.launch({ channel: "chrome", headless: true, args: ["--enable-gpu", "--use-angle=d3d11", "--ignore-gpu-blocklist"] });
for (const rate of [4, 6]) {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  const page = await context.newPage();
  await page.goto("http://localhost:4173/", { waitUntil: "networkidle" });
  await page.waitForTimeout(2600);
  await page.getByRole("button", { name: "Encender sin sonido" }).click();
  await page.waitForTimeout(3200);
  const cdp = await context.newCDPSession(page);
  await cdp.send("Emulation.setCPUThrottlingRate", { rate });
  const stats = await page.evaluate((vh) => new Promise((resolve) => {
    const deltas = []; let last = performance.now(); const start = last; const duration = 6000;
    const frame = (now) => { deltas.push(now - last); last = now; const t = (now - start) / duration;
      window.scrollTo(0, vh * 1.5 * (0.5 - 0.5 * Math.cos(t * Math.PI * 2)));
      if (now - start < duration) requestAnimationFrame(frame);
      else { deltas.shift(); deltas.sort((a, b) => a - b); const avg = deltas.reduce((s, d) => s + d, 0) / deltas.length;
        resolve({ frames: deltas.length, avgFps: +(1000 / avg).toFixed(1), p95ms: +deltas[Math.floor(deltas.length * 0.95)].toFixed(1), worstMs: +deltas[deltas.length - 1].toFixed(1), over33ms: deltas.filter((d) => d > 33.4).length }); } };
    requestAnimationFrame(frame); }), 844);
  console.log(`CPU x${rate}`, JSON.stringify(stats));
  await context.close();
}
await browser.close();
