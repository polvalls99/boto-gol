// Genera el QR de l'app i un cartell imprimible (print.html).
//   npm i --no-save qrcode && node scripts/make-qr.mjs
import QRCode from "qrcode";
import { writeFileSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("..", import.meta.url));
const URL_APP = process.argv[2] || "https://polvalls99.github.io/boto-gol/";

const opts = { errorCorrectionLevel: "H", margin: 2, color: { dark: "#000000", light: "#ffffff" } };

await QRCode.toFile(root + "qr.png", URL_APP, { ...opts, width: 1200 });
const qrData = await QRCode.toDataURL(URL_APP, { ...opts, margin: 1, width: 900 });
const logoData = "data:image/png;base64," + readFileSync(root + "logo.png").toString("base64");
const label = URL_APP.replace(/^https?:\/\//, "").replace(/\/$/, "");

const html = `<!DOCTYPE html>
<html lang="ca">
<head>
<meta charset="utf-8">
<title>Botó Gol — cartell</title>
<style>
  @page { margin: 14mm; }
  *{box-sizing:border-box;margin:0}
  body{font-family:"Segoe UI",system-ui,-apple-system,Arial,sans-serif;
    color:#111;background:#fff;display:flex;min-height:100vh;align-items:center;justify-content:center;padding:24px}
  .card{width:100%;max-width:520px;text-align:center;
    border:3px solid #1b2a6b;border-radius:22px;padding:34px 30px 30px}
  .logo{width:96px;height:96px;object-fit:contain}
  h1{font-size:40px;letter-spacing:.06em;color:#1b2a6b;margin:12px 0 2px}
  .sub{font-size:15px;color:#444;letter-spacing:.02em;margin-bottom:20px}
  .qr{width:min(78%,360px);height:auto;border:1px solid #eee;border-radius:10px}
  .url{margin-top:16px;font-size:16px;font-weight:700;letter-spacing:.03em;
    color:#1b2a6b;word-break:break-all}
  .steps{margin-top:18px;font-size:13px;line-height:1.7;color:#333;text-align:left;
    display:inline-block}
  .steps b{color:#1b2a6b}
  .foot{margin-top:20px;font-size:11px;letter-spacing:.18em;text-transform:uppercase;color:#888}
  @media print{ body{padding:0} .card{border-width:2px} }
</style>
</head>
<body>
  <div class="card">
    <img class="logo" src="${logoData}" alt="CP Riudebitlles">
    <h1>BOTÓ GOL</h1>
    <div class="sub">Escaneja i fes sonar els gols del CP Riudebitlles</div>
    <img class="qr" src="${qrData}" alt="QR ${label}">
    <div class="url">${label}</div>
    <div class="steps">
      1. Escaneja el QR amb la c&agrave;mera del m&ograve;bil<br>
      2. Connecta el m&ograve;bil a l'<b>altaveu Bluetooth</b><br>
      3. Puja el volum i prem <b>GOL</b>
    </div>
    <div class="foot">Club Pat&iacute; Riudebitlles</div>
  </div>
</body>
</html>
`;
writeFileSync(root + "print.html", html);
console.log("-> qr.png  (" + URL_APP + ")");
console.log("-> print.html  (cartell imprimible, autònom)");
