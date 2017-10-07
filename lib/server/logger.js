'use strict'

import 'colors'
import EventEmitter from 'events'

const _colorize = (color) => (arg) => (arg && typeof arg === 'string') ? arg[color] : arg

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
    console.log.apply(this, [this.getTimestamp(), ...args].map(_colorize('blue')))
  }

  info (...args) {
    this.emit('info', [Date.now(), ...args])
    console.info.apply(this, [this.getTimestamp(), ...args].map(_colorize('green')))
  }

  warn (...args) {
    this.emit('warn', [Date.now(), ...args])
    console.warn.apply(this, [this.getTimestamp(), ...args].map(_colorize('yellow')))
  }

  error (...args) {
    // If no listener to the 'error' event, then EventEmitter will throw an Error by itself and stop exec.
    // Normal behavior, only for 'error'. See https://nodejs.org/api/events.html#events_error_events
    this.emit('error', [Date.now(), ...args])
    console.error.apply(this, [this.getTimestamp(), ...args].map(_colorize('red')))
  }
}
