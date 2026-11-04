/* Service Worker: 座位签到 PWA
   - 预缓存核心文件, 断网时可打开页面
   - 为后续锁屏 Web Push (FCM) 预留: 二期在 push 事件里展示通知 */
const CACHE = "seat-checkin-v1";
const ASSETS = ["./", "./index.html", "./manifest.json", "./icon-192.png", "./icon-512.png"];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

/* 网络优先, 失败回缓存(保证签到页总是取最新版本) */
self.addEventListener("fetch", e => {
  e.respondWith(
    fetch(e.request)
      .then(r => { const copy = r.clone(); caches.open(CACHE).then(c => c.put(e.request, copy)); return r; })
      .catch(() => caches.match(e.request))
  );
});

/* ===== 二期预留: 锁屏推送(接入 FCM/VAPID 后启用) =====
self.addEventListener("push", e => {
  const d = e.data ? e.data.json() : {};
  e.waitUntil(self.registration.showNotification(d.title || "座位提醒", {
    body: d.body || "", icon: "icon-192.png", badge: "icon-192.png"
  }));
});
self.addEventListener("notificationclick", e => {
  e.notification.close();
  e.waitUntil(clients.openWindow("./"));
});
*/
