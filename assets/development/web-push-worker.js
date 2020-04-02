/* global self, clients */
/* $VERSIONS$ */

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
