'use strict'

export default class Logger {
  getTimestamp () {
    return (new Date()).toISOString()
  }

  createSubLogger (name) {
    return this
  }

  log (...args) {
    console.log.apply(this, [this.getTimestamp(), ...args])
  }

  info (...args) {
    console.info.apply(this, [this.getTimestamp(), ...args])
  }

  warn (...args) {
    console.warn.apply(this, [this.getTimestamp(), ...args])
  }

  error (...args) {
    console.error.apply(this, [this.getTimestamp(), ...args])
  }
}
