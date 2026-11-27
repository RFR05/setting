// 이 파일이 앱을 기기에 저장해서 인터넷 없이도 열리게 해 줘요. 고칠 필요 없어요.
// 동작: 저장된 화면을 바로 띄우고, 인터넷이 되면 뒤에서 새 버전을 받아 다음 실행 때 보여 줘요.
// 앱에 파일을 새로 추가했다면 FILES에 이름을 넣고 VERSION 숫자를 하나 올려 주세요.
const VERSION = 11;
const CACHE = 'settings-app-v' + VERSION;
const FILES = ['./', './index.html', './icon.png'];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(FILES)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== self.location.origin) return;
  e.respondWith((async () => {
    const cache = await caches.open(CACHE);
    const key = req.mode === 'navigate' ? './index.html' : req;
    const cached = await cache.match(key, { ignoreSearch: true });
    const fresh = fetch(req, { cache: 'no-cache' })
      .then((res) => { if (res && res.ok) cache.put(key, res.clone()); return res; })
      .catch(() => null);
    if (cached) {
      e.waitUntil(fresh);
      return cached;
    }
    const res = await fresh;
    return res || new Response('인터넷에 한 번 연결한 뒤 다시 열어 주세요.', { status: 503, headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
  })());
});
