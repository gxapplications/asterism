'use strict'

import socketIo from 'socket.io'

// private 'asterism' namespace for system
let _asterismSocket = null
let _heartbeat = null
const _manageAsterismSocket = (socket) => {
  console.log('System socket connected.'.magenta)
  if (!_asterismSocket) {
    // we keep only the first ref in case of multiple clients. broadcast is your friend!
    _asterismSocket = _asterismSocket || socket
    _heartbeat = setInterval(() => {
      if (!_asterismSocket) {
        clearInterval(_heartbeat)
      } else {
        _asterismSocket.broadcast.emit('heartbeat', 'boom boom')
      }
    }, 5000)
  }
}

export default class SocketService {
  constructor () {
    this.privateSocketsToRegister = []
    this.publicSocketsToRegister = []
  }

  connect (server) {
    if (this.server) {
      throw new Error('Socket service already connected to server!')
    }
    this.server = server
    this.io = socketIo(this.server)

    // private 'asterism' namespace for system
    const asterismIo = this.io.of('/system/asterism')
    asterismIo.on('connect', _manageAsterismSocket)

    // create and connect private sockets
    this.privateSocketsToRegister.forEach((socketToRegister) => {
      console.log(`Private socket created: ${socketToRegister.namespace}`.grey)
      const privateIo = this.io.of(`/private/${socketToRegister.namespace}`)
      socketToRegister.context.privateSocketIo = socketToRegister.context.privateSocketIo || privateIo
      privateIo.on('connect', (socket) => {
        console.log(`Private socket ${socketToRegister.namespace} connected to a new client: ${socket.client.id}`.magenta)
      })
    })

    // create and connect public sockets
    this.publicSocketsToRegister.forEach((socketToRegister) => {
      console.log(`Public socket created: ${socketToRegister.namespace}`.grey)
      const publicIo = this.io.of(`/public/${socketToRegister.namespace}`)
      socketToRegister.context.publicSocketsIo = socketToRegister.context.publicSocketsIo || {}
      socketToRegister.context.publicSocketsIo[socketToRegister.namespace] = socketToRegister.context.publicSocketsIo[socketToRegister.namespace] || publicIo
      publicIo.on('connect', (socket) => {
        console.log(`Public socket ${socketToRegister.namespace} connected to a new client: ${socket.client.id}`.magenta)
      })
    })
  }

  registerPrivateSocketToContext (namespace, context) {
    this.privateSocketsToRegister.push({ namespace, context })
  }

  registerPublicSocketToContext (namespace, context) {
    if (this.publicSocketsToRegister.find((socket) => socket.namespace === namespace)) {
      throw new Error('This public socket has already been registered')
    }
    this.publicSocketsToRegister.push({ namespace, context })
  }
}
