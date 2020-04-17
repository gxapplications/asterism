'use strict'

import express from 'express'
import webPush from 'web-push'

export default class NotificationService {
  constructor () {
    this.notifications = []
    this.notificationCallbacks = {}
  }

  setWebPush (dataHandler, webPushParams = null) {
    this.dataHandler = dataHandler
    this.webPushParams = webPushParams
    this.webPushSubscriptions = null // still null means webPush notifs unactivated

    if (this.webPushParams && this.webPushParams.publicVapidKey) {
      webPush.setVapidDetails(this.webPushParams.email, this.webPushParams.publicVapidKey, this.webPushParams.privateVapidKey)
      console.log('Web Push subscription is activated')
      this.dataHandler.getItem('web-push-subscriptions')
      .then((subscriptions) => {
        this.webPushSubscriptions = subscriptions || []

        this.webPushSendNotification('Asterism server starting...', 'Server is rebooting, please wait...', 'warning', {
          tag: 'asterism-server-start',
          renotify: true
        })
      })
    } else {
      console.log('Web Push subscription cannot be activated')
    }
  }

  setSocketIo (socketIo) {
    if (!this.socketIo) {
      this.socketIo = socketIo
    }
  }

  connectSocket (socket) {
    socket.on('notification-callback', (id, ack) => {
      if (this.notificationCallbacks[id]) {
        try {
          const result = this.notificationCallbacks[id](socket)
          ack({ success: true, result })
        } catch (error) {
          ack({ success: false, error })
        }
      }
    })
    this.socketIo.emit('notification-update', this.notifications.map((no) => ({ ...no, command: 'set' })))
  }

  createHandler (prefix) {
    return {
      setNotification: (key, icon, css, clickCallback) => {
        const id = `${prefix}§§${key}`
        this.notifications = this.notifications.filter((n) => n.id !== id)
        this.notifications.push({ id, icon, css })
        this.notificationCallbacks[id] = clickCallback || (() => {})
        if (!this.socketIo) {
          console.error('setNotification called too early: sockets are not yet ready!')
        } else {
          this.socketIo.emit('notification-update', this.notifications.map((no) => ({
            ...no,
            command: no.id === id ? 'highlight' : 'set'
          })))
        }
      },
      removeNotification: (id) => {
        this.notifications = this.notifications.filter((n) => n.id !== id)
        delete this.notificationCallbacks[id]
        this.socketIo.emit('notification-update', [{
          command: 'remove',
          id
        }])
      },
      pushNotificationMessage: (title, body, level = 'info', options = {}) => {
        this.webPushSendNotification(title, body, level, options)
      }
    }
  }

  webPushSendNotification (title, body, level = 'info', options = {}, subscriptions = this.webPushSubscriptions) {
    let buildOnly = process.argv.find(arg => arg.match(/^--build-only/))
    if (buildOnly) {
      return
    }

    if (this.webPushSubscriptions === null) {
      console.error('Web Push sendNotification failed (unactivated). Message:', title, body)
      return
    }

    const payload = JSON.stringify({ title, body, icon: `/assets/web-push-logo-${level}.png`, options })

    subscriptions.forEach((subscription, index) => {
      if (!subscription) {
        return
      }
      webPush.sendNotification(subscription, payload).catch(error => {
        console.error('Web Push sendNotification failed for:', subscription, error.stack)
        this.webPushSubscriptions[index] = null
      })
    })

    if (this.webPushSubscriptions.find(e => !e)) {
      this.webPushSubscriptions = this.webPushSubscriptions.filter(e => !!e)
      this.dataHandler.setItem('web-push-subscriptions', this.webPushSubscriptions)
    }
  }

  router () {
    const router = express.Router()

    router.post('/web-push-subscribe', (req, res) => {
      const subscription = req.body
      if (!subscription) {
        console.error('Web Push subscription failed (empty body).')
        return res.status(400).json({})
      }

      res.status(201).json({})

      if (this.webPushSubscriptions === null) {
        console.error('Web Push subscription failed (unactivated).')
        return
      }

      if (this.webPushSubscriptions.find(s => s && (s.endpoint === subscription.endpoint))) {
        this.webPushSubscriptions = this.webPushSubscriptions.map(s => s && (s.endpoint === subscription.endpoint) ? subscription : s)
        this.dataHandler.setItem('web-push-subscriptions', this.webPushSubscriptions)
        .then(() => {
          console.log('Web Push Subscription updated:', subscription)
        })
      } else {
        this.webPushSubscriptions.push(subscription)
        this.dataHandler.setItem('web-push-subscriptions', this.webPushSubscriptions)
        .then(() => {
          console.log('Web Push Subscription added:', subscription)
        })
      }

      this.webPushSendNotification('Asterism notifications ON', 'You are able to receive notifications now.', 'info', {
        silent: true,
        tag: 'web-push-subscribed',
        renotify: true
      }, [subscription])
    })

    return router
  }
}
