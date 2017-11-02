'use strict'

export default class FakeDataHandler {
  constructor (prefix, logger) {
    this.prefix = prefix
    this.logger = logger
    this.tempMemory = {}
  }

  getItem (keyName) {
    const key = `${this.prefix}§§${keyName}`
    if (this.tempMemory[key] === undefined) {
      this.logger.log(`DATA GET not found on ${key}!`)
      return Promise.resolve(undefined)
    }
    this.logger.log(`DATA GET on ${key}!`, this.tempMemory[key])
    return Promise.resolve(this.tempMemory[key])
  }

  setItem (keyName, value) {
    if (value === undefined) {
      return this.removeItem(keyName)
    } else {
      const key = `${this.prefix}§§${keyName}`
      this.tempMemory[key] = value
      this.logger.log(`DATA PUT on ${key}!`, value)
      return Promise.resolve(true)
    }
  }

  removeItem (keyName) {
    const key = `${this.prefix}§§${keyName}`
    delete this.tempMemory[key]
    this.logger.log(`DATA DELETE on ${key}!`)
    return Promise.resolve(true)
  }

  createSubStorage (prefix) {
    return new FakeDataHandler(`${this.prefix}_${prefix}`)
  }
}
