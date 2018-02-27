'use strict'

export default class NotificationService {
  constructor () {
    this.notifications = []
    this.notificationCallbacks = {}
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
      }
    }
  }
}
