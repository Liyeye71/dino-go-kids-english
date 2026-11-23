/* DinoGo · offline cache */
const VERSION = "0.87";
const ASSETS = [
  "./",
  "./index.html",
  "./manifest.webmanifest",
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
  "./images/background/jungle.webp",
  "./images/background/sunset.webp",
  "./images/background/night.webp",
  "./images/background/animal-zoo.webp",
  "./images/background/animal-zoo-map.webp",
  "./images/background/animal-ocean.webp",
  "./data/sounds/action/eat.wav",
  "./data/sounds/action/sleep.wav",
  "./data/sounds/action/jump.wav",
  "./data/sounds/action/run.wav",
  "./data/sounds/action/swim.wav",
  "./data/sounds/action/roar.wav",
  "./data/sounds/action/fly.wav",
  "./data/sounds/action/bark.wav",
  "./data/sounds/action/lick.wav",
  "./data/sounds/action/bite.wav",
  "./data/sounds/action/sing.wav",
  "./data/sounds/action/splash.wav",
  "./data/sounds/action/dig.wav",
  "./data/sounds/action/walk.wav",
  "./data/sounds/action/drink.wav",
  "./data/sounds/action/sniff.wav",
  "./data/sounds/action/laugh.wav",
  "./data/sounds/action/cry.wav",
  "./data/sounds/action/dance.wav",
  "./data/sounds/action/climb.wav",
  "./data/sounds/action/wag.wav",
  "./data/sounds/action/catch.wav",
  "./data/sounds/action/stretch.wav"
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
