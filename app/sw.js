/* DinoGo · offline cache */
const VERSION = "0.59";
const ASSETS = [
  "./",
  "./index.html",
  "./manifest.webmanifest",
  "./images/icons/icon-192.png",
  "./images/icons/icon-512.png",
  "./images/icons/apple-touch-icon.png",
  "./images/dino/egg.webp",
  "./images/dino/baby.webp",
  "./images/dino/teen.webp",
  "./images/dino/adult.webp",
  "./images/dino/super.webp",
  "./images/dino/ultra-1.webp",
  "./images/dino/ultra-2.webp",
  "./images/dino/ultra-3.webp",
  "./images/dino/ultra-4.webp",
  "./images/background/jungle.webp",
  "./images/background/sunset.webp",
  "./images/background/night.webp",
  "./images/background/animal-zoo.webp",
  "./images/background/animal-ocean.webp",
  "./images/icons/avatar-egg.webp",
  "./images/icons/avatar-baby.webp",
  "./images/icons/avatar-teen.webp",
  "./images/icons/avatar-adult.webp",
  "./images/icons/avatar-super.webp",
  "./images/icons/avatar-ultra-1.webp",
  "./images/icons/avatar-ultra-2.webp",
  "./images/icons/avatar-ultra-3.webp",
  "./images/icons/avatar-ultra-4.webp"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(VERSION)
      .then((cache) => cache.addAll(ASSETS).catch(() => {}))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== VERSION).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;
  if (req.mode === "navigate") {
    event.respondWith(
      fetch(req)
        .then((res) => {
          const copy = res.clone();
          caches.open(VERSION).then((cache) => cache.put("./index.html", copy)).catch(() => {});
          return res;
        })
        .catch(() => caches.match("./index.html").then((r) => r || caches.match("./")))
    );
    return;
  }
  if (/\.(js|css)$/.test(new URL(req.url).pathname)) {
    event.respondWith(
      fetch(req)
        .then((res) => {
          const copy = res.clone();
          caches.open(VERSION).then((cache) => cache.put(req, copy)).catch(() => {});
          return res;
        })
        .catch(() => caches.match(req))
    );
    return;
  }
  event.respondWith(
    caches.match(req).then((cached) => cached || fetch(req).then((res) => {
      if (res && res.status === 200 && new URL(req.url).origin === self.location.origin) {
        const copy = res.clone();
        caches.open(VERSION).then((cache) => cache.put(req, copy)).catch(() => {});
      }
      return res;
    }).catch(() => cached))
  );
});
