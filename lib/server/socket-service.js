'use strict'

import socketIo from 'socket.io'

// private 'asterism' namespace for system
let _heartbeat = null
const _manageAsterismSocket = (socketIo, notificationService) => (socket) => {
  console.log('System socket connected.'.magenta)
  if (!_heartbeat) {
    _heartbeat = setInterval(() => {
      if (!socketIo) {
        clearInterval(_heartbeat)
      } else {
        socketIo.emit('heartbeat', 'boom boom')
      }
    }, 8000)
  }

  // executed for each new connected client:
  notificationService.connectSocket(socket)
}

export default class SocketService {
  constructor (notificationService) {
    this.privateSocketsToRegister = []
    this.publicSocketsToRegister = []
    this.notificationService = notificationService
  }

  connect (server) {
    if (this.server) {
      throw new Error('Socket service already connected to server!')
    }
    this.server = server
    this.io = socketIo(this.server)

    // private 'asterism' namespace for system
    const asterismIo = this.io.of('/system/asterism')
    this.notificationService.setSocketIo(asterismIo)
    asterismIo.on('connect', _manageAsterismSocket(asterismIo, this.notificationService))

    // create and connect private sockets
    this.privateSocketsToRegister.forEach((socketToRegister) => {
      console.log(`Private socket created: ${socketToRegister.namespace}`.grey)
      const privateIo = this.io.of(`/private/${socketToRegister.namespace}`)
      socketToRegister.context.privateSocketIo = socketToRegister.context.privateSocketIo || privateIo
      /* privateIo.on('connect', (socket) => {
        console.log(`Private socket ${socketToRegister.namespace} connected to a new client: ${socket.client.id}`.magenta)
      }) */
    })

    // create and connect public sockets
    this.publicSocketsToRegister.forEach((socketToRegister) => {
      console.log(`Public socket created: ${socketToRegister.namespace}`.grey)
      const publicIo = this.io.of(`/public/${socketToRegister.namespace}`)
      socketToRegister.context.publicSocketsIo = socketToRegister.context.publicSocketsIo || {}
      socketToRegister.context.publicSocketsIo[socketToRegister.namespace] = socketToRegister.context.publicSocketsIo[socketToRegister.namespace] || publicIo
      /* publicIo.on('connect', (socket) => {
        console.log(`Public socket ${socketToRegister.namespace} connected to a new client: ${socket.client.id}`.magenta)
      }) */
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
