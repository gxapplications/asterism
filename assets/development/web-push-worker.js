/* global self, clients */

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
