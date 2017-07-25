'use strict'

class DefaultLocalStorage {
  constructor (prefix) {
    this.prefix = prefix
    this.storage = window.localStorage

    if (!this.storage.getItem(this.prefix)) {
      this.storage.setItem(this.prefix, JSON.stringify({}))
    }
  }

  createSubStorage (prefix) {
    return new DefaultLocalStorage(`${this.prefix}_${prefix}`)
  }

  getItem (keyName) {
    return JSON.parse(this.storage.getItem(this.prefix))[keyName]
  }

  setItem (keyName, value) {
    const currentObject = JSON.parse(this.storage.getItem(this.prefix))
    currentObject[keyName] = value
    this.storage.setItem(this.prefix, JSON.stringify(currentObject))
  }

  removeItem (keyName) {
    const currentObject = JSON.parse(this.storage.getItem(this.prefix))
    delete currentObject[keyName]
    this.storage.setItem(this.prefix, JSON.stringify(currentObject))
  }
}

export default DefaultLocalStorage
