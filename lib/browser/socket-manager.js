'use strict'

/* global $ */
import io from 'socket.io-client'

// private 'asterism' namespace for system
let _systemSocket = null
const _systemHandler = (socket, notificationManager) => {
  console.log('System socket connected.')
  socket.on('heartbeat', (message) => {
    $('.navbar-fixed a.brand-logo').addClass('animation pulse').delay(900).queue(function () {
      $(this).removeClass('animation pulse')
      $(this).dequeue()
    })
  })

  // Plug notification manager to system socket
  notificationManager.setCallback((message, ack) => socket.emit('notification-callback', message, ack))
  socket.on('notification-update', (messages) => {
    notificationManager.update(messages)
  })
}

export default class SocketManager {
  constructor (notificationManager) {
    this.sockets = {}
    _systemSocket = io('/system/asterism')
    _systemSocket.on('connect', _systemHandler.bind(this, _systemSocket, notificationManager))
  }

  connectPrivateSocket (namespace) {
    const socketNamespace = `/private/${namespace}`
    const socket = io(socketNamespace)
    socket.on('connect', this.socketConnected.bind(this, socketNamespace))
    return socket
  }

  connectPublicSocket (namespace) {
    const socketNamespace = `/public/${namespace}`
    if (this.sockets[namespace]) {
      return this.sockets[namespace]
    }
    const socket = io(socketNamespace)
    socket.on('connect', this.socketConnected.bind(this, socketNamespace))
    this.sockets[namespace] = socket
    return socket
  }

  socketConnected (socketNamespace) {
    console.log(`Socket ${socketNamespace} connected.`)
  }
}
