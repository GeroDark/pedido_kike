// Servidor estático mínimo con gzip para ./out. Uso: node scripts/qa/server.mjs [carpeta] [puerto]
import http from "node:http"; import fs from "node:fs"; import path from "node:path"; import zlib from "node:zlib";
const root = process.argv[2] || path.join(import.meta.dirname, "..", "..", "out"); const port = Number(process.argv[3] || 4173);
const types = { ".html":"text/html; charset=utf-8", ".js":"text/javascript", ".css":"text/css", ".svg":"image/svg+xml", ".png":"image/png", ".woff2":"font/woff2", ".json":"application/json", ".txt":"text/plain", ".xml":"application/xml" };
const zipped = new Set([".html", ".js", ".css", ".svg", ".json", ".txt", ".xml"]);
http.createServer((req, res) => {
  let p = decodeURIComponent(new URL(req.url, "http://x").pathname);
  let f = path.join(root, p);
  if (fs.existsSync(f) && fs.statSync(f).isDirectory()) f = path.join(f, "index.html");
  if (!fs.existsSync(f)) { res.writeHead(404); res.end("404"); return; }
  const ext = path.extname(f);
  const headers = { "content-type": types[ext] || "application/octet-stream", "cache-control": ext === ".html" ? "no-cache" : "public, max-age=31536000, immutable" };
  if (zipped.has(ext) && /gzip/.test(req.headers["accept-encoding"] || "")) {
    headers["content-encoding"] = "gzip";
    res.writeHead(200, headers); res.end(zlib.gzipSync(fs.readFileSync(f))); return;
  }
  res.writeHead(200, headers); fs.createReadStream(f).pipe(res);
}).listen(port, () => console.log("ready " + port));
