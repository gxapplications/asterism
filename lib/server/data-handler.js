'use strict'

import NoSQL from 'nosql'
import Path from 'path'

const _db = NoSQL.load(Path.resolve('.', 'var', 'db.nosql'))

export default class DataHandler {
  constructor (prefix) {
    this.prefix = prefix
    this.tempMemory = {}
    this.db = _db
    // TODO !0: use a real embedded database (via this.dataHandler) for persistence instead of volatile memory: https://www.npmjs.com/package/nosql
  }

  getItem (keyName) {
    const key = `${this.prefix}§§${keyName}`
    if (this.tempMemory[key] === undefined) {
      console.log(`DATA GET not found on ${key}!`)
      return undefined
    }
    console.log(`DATA GET on ${key}!`, this.tempMemory[key])
    return this.tempMemory[key]
  }

  setItem (keyName, value) {
    if (value === undefined) {
      return this.removeItem(keyName)
    } else {
      const key = `${this.prefix}§§${keyName}`
      this.tempMemory[key] = value
      console.log(`DATA PUT on ${key}!`, value)
      return true
    }
  }

  removeItem (keyName) {
    const key = `${this.prefix}§§${keyName}`
    delete this.tempMemory[key]
    console.log(`DATA DELETE on ${key}!`)
    return true
  }

  createSubStorage (prefix) {
    return new DataHandler(`${this.prefix}_${prefix}`)
  }
}
