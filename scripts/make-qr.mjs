// Genera el QR de l'app + dos impresos:
//   print.html  — full senzill
//   card.html   — targeta premium (enganxina de taula)
//   npm i --no-save qrcode && node scripts/make-qr.mjs
import QRCode from "qrcode";
import { writeFileSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("..", import.meta.url));
const URL_APP = process.argv[2] || "https://polvalls99.github.io/boto-gol/";
const label = URL_APP.replace(/^https?:\/\//, "").replace(/\/$/, "");

const base = { errorCorrectionLevel: "H", margin: 2, color: { dark: "#000000", light: "#ffffff" } };
await QRCode.toFile(root + "qr.png", URL_APP, { ...base, width: 1200 });
const qrBlack = await QRCode.toDataURL(URL_APP, { ...base, margin: 1, width: 1000 });
const qrNavy = await QRCode.toDataURL(URL_APP, {
  ...base, margin: 1, width: 1000, color: { dark: "#0b1633", light: "#ffffff" },
});
const logo = "data:image/png;base64," + readFileSync(root + "logo.png").toString("base64");

/* ---------------------------------------------------------------- print.html */
writeFileSync(root + "print.html", `<!DOCTYPE html><html lang="ca"><head><meta charset="utf-8">
<title>Botó Gol — full</title><style>
@page{margin:14mm}*{box-sizing:border-box;margin:0}
body{font-family:"Segoe UI",system-ui,Arial,sans-serif;color:#111;background:#fff;
  display:flex;min-height:100vh;align-items:center;justify-content:center;padding:24px}
.card{width:100%;max-width:520px;text-align:center;border:3px solid #1b2a6b;border-radius:22px;padding:34px 30px 30px}
.logo{width:96px;height:96px;object-fit:contain}
h1{font-size:40px;letter-spacing:.06em;color:#1b2a6b;margin:12px 0 2px}
.sub{font-size:15px;color:#444;margin-bottom:20px}
.qr{width:min(78%,360px);border:1px solid #eee;border-radius:10px}
.url{margin-top:16px;font-size:16px;font-weight:700;color:#1b2a6b;word-break:break-all}
.steps{margin-top:18px;font-size:13px;line-height:1.7;color:#333;text-align:left;display:inline-block}
.steps b{color:#1b2a6b}
.foot{margin-top:20px;font-size:11px;letter-spacing:.18em;text-transform:uppercase;color:#888}
</style></head><body><div class="card">
<img class="logo" src="${logo}" alt="CP Riudebitlles"><h1>BOTÓ GOL</h1>
<div class="sub">Escaneja i fes sonar els gols del CP Riudebitlles</div>
<img class="qr" src="${qrBlack}" alt="QR ${label}"><div class="url">${label}</div>
<div class="steps">1. Escaneja el QR amb la c&agrave;mera del m&ograve;bil<br>
2. Connecta el m&ograve;bil a l'<b>altaveu Bluetooth</b><br>
3. Puja el volum i prem <b>GOL</b></div>
<div class="foot">Club Pat&iacute; Riudebitlles</div></div></body></html>
`);

/* ---------------------------------------------------------------- card.html */
writeFileSync(root + "card.html", `<!DOCTYPE html>
<html lang="ca">
<head>
<meta charset="utf-8">
<title>Botó Gol — targeta</title>
<style>
  @page { size: 96mm 134mm; margin: 0; }
  :root{
    --plate-1:#23252e; --plate-2:#111218;
    --ivory:#f1ece0; --ink-dim:#8f94a2; --navy-lite:#9fb2e6;
    --red:#e5342b; --red-hi:#ff7d70; --red-lo:#8f1610;
    --gold:#ffd23f; --sen-red:#e2231a; --sen-gold:#f2c500;
    --lcd-1:#0b1a0f; --lcd-2:#12241a; --lcd-ink:#7dffa0;
    --font:"Segoe UI",system-ui,-apple-system,Roboto,Arial,sans-serif;
    --mono:ui-monospace,"SF Mono",Menlo,Consolas,monospace;
  }
  *{box-sizing:border-box;margin:0;padding:0}
  html,body{width:100%;height:100%}
  body{
    background:#2b2d34;
    display:flex;align-items:center;justify-content:center;
    font-family:var(--font);
    -webkit-print-color-adjust:exact;print-color-adjust:exact;
  }
  @media screen{ body{padding:24px} }

  .card{
    position:relative;
    width:96mm;height:134mm;
    padding:9mm 8mm 7mm;
    display:flex;flex-direction:column;gap:4.5mm;
    color:var(--ivory);
    overflow:hidden;
    background:
      radial-gradient(circle at 5.5mm 5.5mm,#5a5d67 0 .7mm,#0e0f14 .9mm 1.7mm,transparent 1.8mm),
      radial-gradient(circle at calc(100% - 5.5mm) 5.5mm,#5a5d67 0 .7mm,#0e0f14 .9mm 1.7mm,transparent 1.8mm),
      radial-gradient(circle at 5.5mm calc(100% - 5.5mm),#5a5d67 0 .7mm,#0e0f14 .9mm 1.7mm,transparent 1.8mm),
      radial-gradient(circle at calc(100% - 5.5mm) calc(100% - 5.5mm),#5a5d67 0 .7mm,#0e0f14 .9mm 1.7mm,transparent 1.8mm),
      repeating-linear-gradient(115deg,rgba(255,255,255,.022) 0 1px,transparent 1px 4px),
      linear-gradient(165deg,var(--plate-1),var(--plate-2));
  }
  @media screen{ .card{border-radius:5mm;box-shadow:0 30px 60px -20px #000,0 0 0 1px #34373f} }

  .card::before{
    content:"";position:absolute;left:0;top:0;bottom:0;width:3mm;
    background:repeating-linear-gradient(180deg,var(--sen-red) 0 5mm,var(--sen-gold) 5mm 10mm);
    box-shadow:inset -1px 0 2px rgba(0,0,0,.5);
  }

  .head{display:flex;align-items:center;gap:3mm}
  .badge{width:14mm;height:14mm;object-fit:contain;filter:drop-shadow(0 1px 2px rgba(0,0,0,.6))}
  .titles{flex:1;min-width:0}
  .titles .t1{font-weight:900;letter-spacing:.1em;font-size:6.4mm;line-height:1}
  .titles .t2{margin-top:1mm;font-size:2.5mm;letter-spacing:.32em;
    color:var(--navy-lite);font-weight:800}
  .gol{
    flex:0 0 auto;width:13mm;height:13mm;border-radius:50%;
    display:flex;align-items:center;justify-content:center;
    color:#fff;font-weight:900;font-size:3.4mm;line-height:1;
    background:radial-gradient(circle at 38% 30%,var(--red-hi),var(--red) 55%,var(--red-lo));
    box-shadow:0 0 0 .5mm #0b0c10,inset 0 .7mm 1mm rgba(255,255,255,.4),
      inset 0 -1mm 1.6mm rgba(0,0,0,.4),0 1mm 2mm rgba(229,52,43,.5);
  }

  /* tira LCD — text centrat compensant el letter-spacing */
  .lcd{
    position:relative;overflow:hidden;border-radius:2mm;padding:2.6mm 3mm;
    text-align:center;text-indent:.22em;
    background:linear-gradient(180deg,var(--lcd-1),var(--lcd-2));
    box-shadow:inset 0 .5mm 2mm #000,0 0 0 .3mm #2a2f2a;
    font-family:var(--mono);color:var(--lcd-ink);
    font-size:2.6mm;letter-spacing:.22em;
    text-shadow:0 0 1.5mm rgba(125,255,160,.5);
  }
  .lcd span{position:relative;z-index:1}
  .lcd::after{content:"";position:absolute;inset:0;
    background:repeating-linear-gradient(rgba(0,0,0,.16) 0 1px,transparent 1px 3px)}

  .qrbox{
    flex:1;min-height:0;display:flex;align-items:center;justify-content:center;
    background:#fff;border-radius:3mm;padding:3.5mm;
    box-shadow:inset 0 0 0 .3mm #d7d3c6,0 1mm 3mm rgba(0,0,0,.45);
  }
  .qrbox img{max-width:100%;max-height:100%;object-fit:contain}

  .url{text-align:center;font-family:var(--mono);font-weight:600;font-size:3mm;
    letter-spacing:.02em;color:var(--gold);word-break:break-all}
  .rule{height:.3mm;background:linear-gradient(90deg,transparent,#3f424c 50%,transparent)}
  .hint{text-align:center;font-size:2.5mm;line-height:1.55;color:var(--ink-dim);
    max-width:64mm;margin:0 auto;text-wrap:balance}
  .hint b{color:var(--ivory)}
  .foot{text-align:center;text-indent:.28em;font-size:2mm;font-weight:800;
    text-transform:uppercase;letter-spacing:.28em;color:#5a5e69}
</style>
</head>
<body>
  <div class="card">
    <div class="head">
      <img class="badge" src="${logo}" alt="CP Riudebitlles">
      <div class="titles">
        <div class="t1">BOTÓ&nbsp;GOL</div>
        <div class="t2">CP&nbsp;RIUDEBITLLES</div>
      </div>
      <div class="gol">GOL</div>
    </div>

    <div class="lcd"><span>ESCANEJA &middot; FES SONAR ELS GOLS</span></div>

    <div class="qrbox"><img src="${qrNavy}" alt="QR ${label}"></div>

    <div class="url">${label}</div>
    <div class="rule"></div>
    <div class="hint">Connecta el m&ograve;bil a l'<b>altaveu Bluetooth</b>, puja el volum i prem <b>GOL</b></div>
    <div class="foot">Club Pat&iacute; Riudebitlles</div>
  </div>
</body>
</html>
`);

console.log("-> qr.png");
console.log("-> print.html   (full senzill)");
console.log("-> card.html    (targeta premium, 96×145 mm)");
