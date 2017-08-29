'use strict'

import io from 'socket.io-client'

// private 'asterism' namespace for system
let _systemSocket = null
const _systemHandler = (socket) => {
  // TODO !3: events to add: heart beat, with status on UI
  socket.on('pouf', (message) => {
    console.log('POUF!', message)
  })
  socket.emit('paf', 'c est moi le meilleur!')
}

export default class SocketManager {
  constructor () {
    this.sockets = {}
    _systemSocket = io('/system/asterism')
    _systemSocket.on('connect', _systemHandler.bind(this, this.sockets['/system/asterism']))
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
