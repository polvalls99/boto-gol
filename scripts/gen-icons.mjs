// Genera els icones PNG de la PWA sense dependències.  node scripts/gen-icons.mjs
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

const mix = (a, b, t) => a.map((v, i) => Math.round(v + (b[i] - v) * t));

function render(size) {
  const bg = [14, 15, 19];        // #0e0f13
  const ringC = [11, 12, 16];     // #0b0c10
  const rInner = [255, 115, 103]; // #ff7367
  const rMid = [229, 52, 43];     // #e5342b
  const rDark = [143, 22, 16];    // #8f1610
  const cx = size / 2, cy = size / 2;
  const R = size * 0.34;
  const ring = Math.max(2, size * 0.018);
  const lx = cx - R * 0.32, ly = cy - R * 0.42; // punt de llum

  const raw = Buffer.alloc(size * (size * 4 + 1));
  let p = 0;
  for (let y = 0; y < size; y++) {
    raw[p++] = 0; // filtre
    for (let x = 0; x < size; x++) {
      const d = Math.hypot(x - cx, y - cy);
      let col = bg, a = 255;
      if (d <= R) {
        const g = Math.min(1, Math.hypot(x - lx, y - ly) / (R * 1.55));
        col = g < 0.5 ? mix(rInner, rMid, g / 0.5) : mix(rMid, rDark, (g - 0.5) / 0.5);
      } else if (d <= R + ring) {
        col = ringC;
      }
      raw[p++] = col[0]; raw[p++] = col[1]; raw[p++] = col[2]; raw[p++] = a;
    }
  }

  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0); ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8; ihdr[9] = 6; ihdr[10] = 0; ihdr[11] = 0; ihdr[12] = 0;

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
