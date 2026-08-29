// Genera els icones PNG de la PWA sense dependències.  node scripts/gen-icons.mjs
// Dibuixa el distintiu del CP Riudebitlles simplificat: anella blava, senyera
// vertical, estic i bola. (El logo complet amb el nom corbat és a ../logo.svg.)
import { deflateSync } from "node:zlib";
import { writeFileSync, mkdirSync } from "node:fs";

const OUT = new URL("../icons/", import.meta.url);
mkdirSync(OUT, { recursive: true });

const crcTable = (() => {
  const t = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c >>> 0;
  }
  return t;
})();
const crc32 = (buf) => {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) c = crcTable[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
};
const chunk = (type, data) => {
  const t = Buffer.from(type, "latin1");
  const len = Buffer.alloc(4); len.writeUInt32BE(data.length);
  const crc = Buffer.alloc(4); crc.writeUInt32BE(crc32(Buffer.concat([t, data])));
  return Buffer.concat([len, t, data, crc]);
};

function segDist(px, py, ax, ay, bx, by) {
  const dx = bx - ax, dy = by - ay;
  const l2 = dx * dx + dy * dy;
  let t = l2 ? ((px - ax) * dx + (py - ay) * dy) / l2 : 0;
  t = Math.max(0, Math.min(1, t));
  return Math.hypot(px - (ax + t * dx), py - (ay + t * dy));
}

function render(N) {
  const c = N / 2;
  const R = 0.49 * N;        // vora del disc blanc
  const rIn = 0.335 * N;     // cercle de la senyera
  const rRingIn = 0.35 * N;  // interior de l'anella blava
  const ax = 0.76 * N, ay = 0.24 * N, bx = 0.30 * N, by = 0.78 * N; // estic
  const ballx = 0.245 * N, bally = 0.795 * N, ballr = 0.062 * N;    // bola
  const stripeW = (2 * rIn) / 9;
  const NAVY = [27, 42, 107], RED = [226, 35, 26], YEL = [242, 197, 0], WHITE = [255, 255, 255];

  const raw = Buffer.alloc(N * (N * 4 + 1));
  let p = 0;
  for (let y = 0; y < N; y++) {
    raw[p++] = 0;
    for (let x = 0; x < N; x++) {
      const d = Math.hypot(x - c, y - c);
      let col = WHITE, a = 0;
      if (d <= R) { a = 255; col = WHITE; }
      if (d > rRingIn && d <= R) col = NAVY;
      if (d <= rIn) {
        const s = Math.floor((x - (c - rIn)) / stripeW);
        col = (s % 2 === 0) ? RED : YEL;
      }
      if (d > rIn - 2 && d <= rIn) col = NAVY;
      const ds = segDist(x, y, ax, ay, bx, by);
      if (ds < 0.085 * N) { col = NAVY; a = 255; }
      if (ds < 0.052 * N) { col = WHITE; a = 255; }
      const db = Math.hypot(x - ballx, y - bally);
      if (db < ballr + 2) { col = WHITE; a = 255; }
      if (db < ballr) { col = RED; a = 255; }
      raw[p++] = col[0]; raw[p++] = col[1]; raw[p++] = col[2]; raw[p++] = a;
    }
  }

  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(N, 0); ihdr.writeUInt32BE(N, 4);
  ihdr[8] = 8; ihdr[9] = 6;
  return Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    chunk("IHDR", ihdr),
    chunk("IDAT", deflateSync(raw, { level: 9 })),
    chunk("IEND", Buffer.alloc(0)),
  ]);
}

for (const [name, size] of [["icon-192.png", 192], ["icon-512.png", 512], ["apple-touch-icon.png", 180]]) {
  writeFileSync(new URL(name, OUT), render(size));
  console.log("->", name, size + "x" + size);
}
