'use strict'

/* global $ */
import io from 'socket.io-client'

const mainOptions = {
  reconnection: true,
  reconnectionAttempts: 100,
  reconnectionDelay: 3000,
  reconnectionDelayMax: 10000
  // forceNew: true // causes crash
}

// private 'asterism' namespace for system
let _systemSocket = null
const _systemHandler = (socket, notificationManager, logger) => {
  logger.log('System socket connected.')
  socket.on('heartbeat', (message) => {
    $('.navbar-fixed a.brand-logo').removeClass('missing-air').addClass('animation pulse').delay(900).queue(function () {
      $(this).removeClass('animation pulse').addClass('missing-air')
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
  constructor (logger) {
    this.logger = logger
    this.sockets = {}
  }

  generateSystemSocket (notificationManager) {
    if (_systemSocket) {
      return null // do not return this private socket after first call
    }
    _systemSocket = io('/system/asterism', mainOptions)
    _systemSocket.on('connect', _systemHandler.bind(this, _systemSocket, notificationManager, this.logger))
    return _systemSocket
  }

  connectPrivateSocket (namespace) {
    const socketNamespace = `/private/${namespace}`
    const socket = io(socketNamespace, mainOptions)
    socket.on('connect', this.socketConnected.bind(this, socketNamespace))
    return socket
  }

  connectPublicSocket (namespace) {
    if (!namespace) {
      return null
    }
    const socketNamespace = `/public/${namespace}`
    if (this.sockets[namespace]) {
      return this.sockets[namespace]
    }
    const socket = io(socketNamespace, mainOptions)
    socket.on('connect', this.socketConnected.bind(this, socketNamespace))
    this.sockets[namespace] = socket
    return socket
  }

  socketConnected (socketNamespace) {
    // this.logger.log(`Socket ${socketNamespace} connected.`)
  }
}
