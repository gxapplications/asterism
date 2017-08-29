'use strict'

import socketIo from 'socket.io'

// TODO !0: from 1 server and 2 browsers, can we connect to the same socket ?

// private 'asterism' namespace for system
let _asterismSocket = null
const _manageAsterismSocket = (socket) => {
  _asterismSocket = socket
  console.log('System socket connected.'.magenta)

  _asterismSocket.on('paf', (message) => {
    console.log('PAF!', message)
    _asterismSocket.emit('pouf', 'je sais...')
  })
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
      privateIo.on('connect', (socket) => {
        console.log(`Private socket connected: ${socketToRegister.namespace}`.magenta)
        socketToRegister.context.privateSocket = socket
      })
    })

    // create and connect public sockets
    this.publicSocketsToRegister.forEach((socketToRegister) => {
      console.log(`Public socket created: ${socketToRegister.namespace}`.grey)
      const publicIo = this.io.of(`/public/${socketToRegister.namespace}`)
      publicIo.on('connect', (socket) => {
        console.log(`Public socket connected: ${socketToRegister.namespace}`.magenta)
        socketToRegister.context.publicSockets = socketToRegister.context.publicSockets || {}
        socketToRegister.context.publicSockets[socketToRegister.namespace] = socket
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
