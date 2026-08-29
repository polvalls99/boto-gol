# Botó Gol

Comandament web per celebrar els gols. **Web estàtica, sense servidor.** El mòbil
es connecta a l'altaveu Bluetooth i reprodueix els himnes ell mateix.

- Funciona **sense connexió** un cop oberta amb internet (es baixa tot).
- **Instal·lable** com a app (PWA): queda a la pantalla d'inici amb icona pròpia.
- Un botó gros de **GOL** (himne a l'atzar), **PARAR**, **RANDOM**, volum i
  selector d'himnes. Estil comandament retro, a pantalla completa.

## Com es fa servir

1. Connecta el mòbil a l'**altaveu Bluetooth** (Ajustos → Bluetooth).
2. Obre la web (QR o enllaç).
3. Puja el volum del mòbil i prem **GOL**. Torna a prémer GOL o **PARAR** per aturar.
4. **Instal·la-la**: a Android surt el botó «INSTAL·LA L'APP»; a l'iPhone,
   Compartir → «Afegeix a la pantalla d'inici».
5. A partir d'aquí ja funciona **sense internet**.

## Penjar-ho a GitHub Pages

```bash
git init -b main
git add -A
git commit -m "Botó Gol"
# crea un repo buit a github.com (p. ex. "boto-gol") i:
git remote add origin https://github.com/<usuari>/boto-gol.git
git push -u origin main
```

A GitHub: **Settings → Pages → Build and deployment → Source: Deploy from a
branch → Branch: `main` / `/ (root)` → Save**.

Al cap d'un minut tindràs la web a:
`https://<usuari>.github.io/boto-gol/`

Fes un **QR** d'aquesta adreça (qualsevol generador) i enganxa'l a la caixa.

## Afegir o canviar himnes

1. Posa el `.mp3` a `sounds/` amb nom sense espais ni accents (`la-bamba.mp3`).
2. Afegeix-lo a `sounds.js` amb el nom que ha de sortir.
3. A `sw.js`: afegeix el fitxer a `ASSETS` i **puja el número de `CACHE`**
   (`boto-gol-v3` → `boto-gol-v4`), si no els mòbils no es baixaran la versió nova.
4. `git add -A && git commit -m "nou himne" && git push`.

## Estructura

```
index.html            pantalla del comandament
style.css             disseny (retro, pantalla completa, sense scroll)
app.js                tota la lògica (reproducció, aleatori, volum, PWA)
sounds.js             llista d'himnes
sw.js                 service worker → funciona offline
manifest.webmanifest  metadades de la PWA
sounds/               els .mp3
icons/                icones de l'app  (icon.svg és la font; els PNG els fa scripts/gen-icons.mjs)
scripts/gen-icons.mjs  regenera els PNG a partir del disseny  (node scripts/gen-icons.mjs)
```

## Provar-ho en local

Doble clic a `index.html` per veure el disseny (el so pot no sonar amb `file://`
segons el navegador). Per provar-ho de veritat, amb offline i PWA, cal servir-ho
per http — o simplement puja-ho a Pages.

## Notes

- Només **un mòbil** pot estar connectat a l'altaveu Bluetooth alhora.
- Ja **no cal cap Raspberry**: tot passa al mòbil.
- iOS: si bloqueges el mòbil, el so es pot aturar (limitació del navegador). Amb
  la pantalla encesa (l'app ho força mentre està oberta) va bé.
