// Genera els icones PNG de la PWA a partir de ../logo.png (logo oficial del club).
//   npm i --no-save jimp && node scripts/gen-icons.mjs
import { Jimp } from "jimp";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("..", import.meta.url));
const src = await Jimp.read(root + "logo.png");

// [nom, mida, marge relatiu, fons]
const specs = [
  ["icons/icon-192.png", 192, 0.06, 0x00000000], // transparent (purpose "any")
  ["icons/icon-512.png", 512, 0.06, 0x00000000],
  ["icons/apple-touch-icon.png", 180, 0.10, 0xffffffff], // iOS: fons blanc
];

for (const [name, size, pad, bg] of specs) {
  const canvas = new Jimp({ width: size, height: size, color: bg });
  const inner = Math.round(size * (1 - pad * 2));
  const logo = src.clone().resize({ w: inner, h: inner });
  canvas.composite(logo, Math.round((size - inner) / 2), Math.round((size - inner) / 2));
  await canvas.write(root + name);
  console.log("->", name, size + "x" + size);
}
