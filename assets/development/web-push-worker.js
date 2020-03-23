/* global self, clients, caches, fetch */

const CACHE_VERSION = '1.2.9'
const FILES_TO_CACHE = ['/offline.html', '/']

self.addEventListener('install', ev => {
  console.log(`Installing new web-push worker version...`)

  ev.waitUntil(
    caches.open(CACHE_VERSION).then((cache) => {
      console.log('[ServiceWorker] Pre-caching offline page')
      return cache.addAll(FILES_TO_CACHE)
    })
  )

  return self.skipWaiting()
})

self.addEventListener('activate', ev => {
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

// TODO !0: support much more elements:
// options.badge: the same for everybody: asterism ico
// options.actions: https://developers.google.com/web/fundamentals/push-notifications/display-a-notification#actions
// https://developer.mozilla.org/en-US/docs/Web/API/ServiceWorkerRegistration/showNotification
