// 静态离线缓存；更新文件内容时，递增缓存版本即可。
const CACHE='shanxi-jiangxi-trip-2026-v1';
const CORE=['./','./index.html','./manifest.webmanifest','./assets/icon.svg'];
self.addEventListener('install',event=>{event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(CORE)).then(()=>self.skipWaiting()))});
self.addEventListener('activate',event=>{event.waitUntil(caches.keys().then(names=>Promise.all(names.filter(n=>n.startsWith('shanxi-jiangxi-trip-2026-')&&n!==CACHE).map(n=>caches.delete(n)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',event=>{if(event.request.method!=='GET'||!event.request.url.startsWith(self.location.origin))return;event.respondWith(fetch(event.request).then(res=>{if(res.ok){const copy=res.clone();caches.open(CACHE).then(cache=>cache.put(event.request,copy))}return res}).catch(()=>caches.match(event.request).then(r=>r||caches.match('./index.html'))))});