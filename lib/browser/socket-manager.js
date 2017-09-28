'use strict'

import io from 'socket.io-client'

// private 'asterism' namespace for system
let _systemSocket = null
const _systemHandler = (socket) => {
  console.log('System socket connected.')
  socket.on('heartbeat', (message) => {
    console.log('Heartbeat:', message)
    $('.navbar-fixed a.brand-logo').addClass('animation pulse').delay(900).queue(function(){
      $(this).removeClass('animation pulse')
      $(this).dequeue()
    })
  })
}

export default class SocketManager {
  constructor () {
    this.sockets = {}
    _systemSocket = io('/system/asterism')
    _systemSocket.on('connect', _systemHandler.bind(this, _systemSocket))
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
