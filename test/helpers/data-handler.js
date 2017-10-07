'use strict'

export default class FakeDataHandler {
  constructor (prefix, logger) {
    this.prefix = prefix
    this.logger = logger
    this.tempMemory = {}
  }

  getItem (keyName, forcePrefix, path) {
    let key = `${forcePrefix || this.prefix}§§${keyName}`
    if (path) {
      key = `${key}@@${path}`
    }
    if (this.tempMemory[key] === undefined) {
      // this.logger.log(`DATA GET not found on ${key}!`)
      return Promise.resolve(undefined)
    }
    // this.logger.log(`DATA GET on ${key}!`, this.tempMemory[key])
    return Promise.resolve(this.tempMemory[key])
  }

  setItem (keyName, value, forcePrefix, path) {
    if (value === undefined) {
      return this.removeItem(keyName, forcePrefix, path)
    } else {
      let key = `${forcePrefix || this.prefix}§§${keyName}`
      if (path) {
        key = `${key}@@${path}`
      }
      this.tempMemory[key] = value
      // this.logger.log(`DATA PUT on ${key}!`, value)
      return Promise.resolve(true)
    }
  }

  removeItem (keyName, forcePrefix, path) {
    let key = `${forcePrefix || this.prefix}§§${keyName}`
    if (path) {
      key = `${key}@@${path}`
    }
    delete this.tempMemory[key]
    // this.logger.log(`DATA DELETE on ${key}!`)
    return Promise.resolve(true)
  }

  listItems (filter, forcePrefix, path) {
    const key = new RegExp(`^${forcePrefix || this.prefix}§§.*${path ? '@@' + path : ''}$`)
    const prefix = new RegExp(`^${forcePrefix || this.prefix}§§`)
    const suffix = new RegExp(`${path ? '@@' + path : ''}$`)
    let results = Object.entries(this.tempMemory)
    .filter((entry) => key.test(entry[0]))
    .map((result) => ({
      item: result[1],
      keyName: result[0].replace(prefix, '').replace(suffix, ''),
      prefix: forcePrefix || this.prefix,
      path: path || false,
      update: Date.now(), // wrong value for the mock
      select: Date.now() // wrong value for the mock
    }))
    .filter(filter)

    return Promise.resolve(results)
  }

  createSubStorage (prefix) {
    return new FakeDataHandler(`${this.prefix}_${prefix}`)
  }
}
