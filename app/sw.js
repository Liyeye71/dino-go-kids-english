/* DinoGo · offline cache */
const VERSION = "1.4";
const ASSETS = [
  "./",
  "./index.html",
  "./manifest.webmanifest",
  "./font/ZCOOLKuaiLe.woff2",
  "./data/icons/icon-192.png",
  "./data/icons/icon-512.png",
  "./data/icons/apple-touch-icon.png",
  "./images/dino/egg.webp",
  "./images/dino/baby.webp",
  "./images/dino/teen.webp",
  "./images/dino/adult.webp",
  "./images/dino/super.webp",
  "./images/dino/ultra-1.webp",
  "./images/dino/ultra-2.webp",
  "./images/dino/ultra-3.webp",
  "./images/dino/ultra-4.webp",
  "./images/dino/ultra-5.webp",
  "./images/dino/ultra-6.webp",
  "./images/dino/ultra-7.webp",
  "./images/dino/ultra-8.webp",
  "./images/dino/ultra-9.webp",
  "./images/dino/ultra-10.webp",
  "./images/dino/ultra-11.webp",
  "./images/dino/ultra-12.webp",
  "./images/dino/ultra-13.webp",
  "./images/dino/ultra-14.webp",
  "./images/background/jungle.webp",
  "./images/background/sunset.webp",
  "./images/background/night.webp",
  "./images/background/animal-zoo-map.webp",
  "./images/background/theme-animal.webp",
  "./images/background/theme-school.webp",
  "./images/background/theme-travel.webp"
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
