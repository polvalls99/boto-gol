/* Service worker — fa que el comandament funcioni sense connexió.
   Precacha tota l'app i els himnes; després serveix des de la memòria.
   Si canvies fitxers (o afegeixes himnes), puja el número de CACHE. */
const CACHE = "boto-gol-v3";

const ASSETS = [
  "./",
  "index.html",
  "style.css",
  "app.js",
  "sounds.js",
  "manifest.webmanifest",
  "icons/icon.svg",
  "icons/icon-192.png",
  "icons/icon-512.png",
  "icons/apple-touch-icon.png",
  "sounds/dup-dup.mp3",
  "sounds/kernkraft-400.mp3",
  "sounds/piu-piu.mp3",
];

self.addEventListener("install", (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE);
    await cache.addAll(ASSETS);
    self.skipWaiting();
  })());
});

self.addEventListener("activate", (event) => {
  event.waitUntil((async () => {
    for (const key of await caches.keys()) {
      if (key !== CACHE) await caches.delete(key);
    }
    self.clients.claim();
  })());
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;
  event.respondWith((async () => {
    const cached = await caches.match(request, { ignoreSearch: true });
    if (cached) return cached;
    try {
      const res = await fetch(request);
      if (res.ok && new URL(request.url).origin === location.origin) {
        (await caches.open(CACHE)).put(request, res.clone());
      }
      return res;
    } catch (_) {
      return cached || new Response("offline", { status: 503 });
    }
  })());
});
