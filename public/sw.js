// Files to cache
const cacheName = 'zoomin-v008';
const precacheAssets = [
	'/index.html',
	'/assets/index.js',
	'/assets/index.css'
];

// Installing Service Worker
self.addEventListener('install', (e) => {
	e.waitUntil(
		caches.open(cacheName).then((cache) => {
			return cache.addAll(precacheAssets);
		})
	);
});

self.addEventListener('activate', (e) => {
	e.waitUntil(
		caches.keys().then((keyList) => {
			return Promise.all(
				keyList.map((key) => {
					if (key === cacheName) return;
					return caches.delete(key);
				}),
			);
		})
	);
});

self.addEventListener('fetch', (e) => {
	const url = new URL(e.request.url);

	// Only local files
	if (location.host != url.host) return;

	// network first cache strategy from https://developer.chrome.com/docs/workbox/caching-strategies-overview/
	e.respondWith(
		caches.open(cacheName).then((cache) => {
			return fetch(e.request.url).then((fetchedResponse) => {
				cache.put(e.request, fetchedResponse.clone());
				return fetchedResponse;
			}).catch(() => {
				return cache.match(e.request.url);
			});
		})
	);
});