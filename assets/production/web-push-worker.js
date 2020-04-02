/* global self, clients, caches, fetch, URL */

const CACHE_VERSION = '$VERSIONS$'
const FILES_TO_CACHE = ['', '/',
  '/web-push-worker.js',
  '/manifest.json',
  '/offline.html',
  '/jquery/jquery.min.js',
  '/node-forge/forge.min.js',
  '/assets/patternlock.min.js',
  '/assets/patternlock.min.css',
  '/assets/material-icons.css',
  '/materialize-css/css/materialize.min.css',
  '/materialize-css-extras/noUiSlider/nouislider.css',
  '/materialize-css/js/materialize.min.js',
  '/assets/jquery.initialize.min.j',
  '/build/common.js',
  '/build/plugins.js',
  '/build/bundle.js'
]

self.addEventListener('install', ev => {
  console.log(`[ServiceWorker] Installing new web-push worker version...`)

  ev.waitUntil(
    caches.open(CACHE_VERSION).then((cache) => {
      console.log('[Serviceorker] Pre-caching offline page')
      return cache.addAll(FILES_TO_CACHE)
    })
  )

  return self.skipWaiting()
})

self.addEventListener('activate', ev => {
  console.log(`[ServiceWorker] Activating service worker...`)

  ev.waitUntil(
    caches.keys().then((keyList) => {
      return Promise.all(keyList.map((key) => {
        if (key !== CACHE_VERSION) {
          console.log('[ServiceWorker] Removing old cache', key)
          return caches.delete(key)
        }
      }))
    })
  )

  return self.clients.claim()
})

self.addEventListener('fetch', ev => {
  ev.respondWith(
    // Try the cache
    caches.match(ev.request).then(response => {
      const url = new URL(ev.request.url)
      if (url.pathname === '/') {
        return fetch(ev.request)
      }
      return response || fetch(ev.request)
    }).catch(() => {
      return caches.match('/offline.html')
    })
  )
})

self.addEventListener('push', ev => {
  const data = ev.data.json()
  console.log('Got push', data)
  const promiseChain = self.registration.showNotification(data.title, {
    ...data.options,
    body: data.body || '',
    icon: data.icon || '/assets/web-push-logo-info.png',
    badge: '/assets/asterism.ico.png'
  })

  ev.waitUntil(promiseChain)
})

self.addEventListener('notificationclick', ev => {
  const url = ev.notification.data && ev.notification.data.url
  ev.notification.close()
  if (url) {
    ev.waitUntil(clients.openWindow(url))
  }
})
