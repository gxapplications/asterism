'use strict'

import EventEmitter from 'events'

export default class Logger extends EventEmitter {
  constructor (socketService, name = '') {
    super()
    this.socketService = socketService
    this.name = name
  }

  getTimestamp () {
    return (new Date()).toISOString()
  }

  createSubLogger (name) {
    return new Logger(this.socketService, `${this.name} > ${name}`)
  }

  log (...args) {
    this.emit('log', [Date.now(), ...args])
    console.log.apply(this, [this.getTimestamp(), ...args].map((arg) => arg.blue))
  }

  info (...args) {
    this.emit('info', [Date.now(), ...args])
    console.info.apply(this, [this.getTimestamp(), ...args].map((arg) => arg.green))
  }

  warn (...args) {
    this.emit('warn', [Date.now(), ...args])
    console.warn.apply(this, [this.getTimestamp(), ...args].map((arg) => arg.yellow))
  }

  error (...args) {
    this.emit('error', [Date.now(), ...args])
    console.error.apply(this, [this.getTimestamp(), ...args].map((arg) => arg.red))
  }
}
