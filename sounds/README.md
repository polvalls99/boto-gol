# Himnes

Els fitxers de so de l'app. **Noms sense espais ni accents** (van a la URL):
`la-bamba.mp3`, `campions.mp3`…

Per afegir-ne un:
1. Posa el `.mp3` (o `.wav`/`.ogg`) aquí.
2. Afegeix una línia a `../sounds.js` amb el nom que ha de sortir al comandament.
3. A `../sw.js`, afegeix el fitxer a la llista `ASSETS` i **puja el número de `CACHE`**
   (`boto-gol-v3` → `boto-gol-v4`) perquè els mòbils es baixin la versió nova.
4. `git add . && git commit && git push`.
