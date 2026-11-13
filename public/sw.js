// Service worker של SeaVibes: מאפשר התקנה למסך הבית ופתיחה בלי רשת (FR-18).
// עובד רק מול האתר שלנו עצמו. לא פונה לשום כתובת חיצונית.
// - דפים וקובץ הנתונים: קודם מהרשת, ואם אין רשת מהעותק השמור.
// - קבצי האתר (assets) והאייקונים: מהעותק השמור, כי שמם משתנה בכל גרסה.
// כשקובץ הנתונים מגיע מהעותק השמור, מסומן בכותרת X-SeaVibes-Cached-At מתי נשמר.
// מתי נוגעים: כשמשנים מה נשמר לשימוש בלי רשת. אחרי שינוי מעלים את CACHE.
const CACHE = 'seavibes-v1';
const SHELL = ['/', '/manifest.webmanifest', '/icons/icon-192.png', '/icons/icon-512.png'];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

async function networkFirst(request, cacheKey) {
  const cache = await caches.open(CACHE);
  try {
    const response = await fetch(request);
    if (response.ok) {
      const headers = new Headers(response.headers);
      headers.set('X-SeaVibes-Cached-At', new Date().toISOString());
      const body = await response.clone().blob();
      await cache.put(cacheKey, new Response(body, { status: 200, headers }));
    }
    return response;
  } catch {
    const cached = await cache.match(cacheKey);
    if (cached) return cached;
    throw new Error('offline and not cached');
  }
}

async function cacheFirst(request) {
  const cache = await caches.open(CACHE);
  const cached = await cache.match(request);
  if (cached) return cached;
  const response = await fetch(request);
  if (response.ok) await cache.put(request, response.clone());
  return response;
}

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  if (event.request.method !== 'GET' || url.origin !== self.location.origin) return;
  if (event.request.mode === 'navigate') {
    event.respondWith(networkFirst(event.request, '/'));
  } else if (url.pathname.startsWith('/data/')) {
    event.respondWith(networkFirst(event.request, url.pathname));
  } else if (url.pathname.startsWith('/assets/') || url.pathname.startsWith('/icons/')) {
    event.respondWith(cacheFirst(event.request));
  }
});
