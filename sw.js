const CACHE_NAME = 'diary-cache-v3';
const urlsToCache = [
  './index.html',
  './icon-192.png',
  './icon-512.png',
  './apple-touch-icon.png',
  './hezhao.jpg'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('缓存已打开');
        // 为避免因个别文件缺失导致整个缓存失败，采取忽略错误的方式
        return Promise.all(
          urlsToCache.map(url => {
            return cache.add(url).catch(err => console.log('文件缓存失败，跳过: ', url, err));
          })
        );
      })
  );
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  // 只拦截 GET 请求，且排除 Bmob 的 API 接口，保证数据是最新的
  if (event.request.method !== 'GET' || event.request.url.includes('api.bmobcloud.com')) {
    return;
  }
  
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // 如果命中缓存，优先返回缓存的资源 (比如 js, css, 图片等静态文件)
        // 否则向网络发出真实请求
        return response || fetch(event.request);
      })
  );
});
