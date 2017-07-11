'use strict'

import EventEmitter from 'events'

const parseGridChildren = (gridNode) => {
  const children = []
  for (const i of gridNode.children) {
    children.push({ id: i.id, guid: i.attributes['data-gridifier-guid'].value })
  }
  return children.sort((a, b) => {
    return a.guid - b.guid
  })
}

export default class LocalStorageHandler extends EventEmitter {
  constructor (storage, key, defaultOrder = []) {
    super()
    this.storage = storage
    this.key = key
    const storeContent = this.storage.getItem(this.key)
    this.persistedOrder = storeContent ? JSON.parse(storeContent) : defaultOrder
  }

  onChange (gridNode) {
    const order = parseGridChildren(gridNode)
    this.setLocalOrder(order)
  }

  setLocalOrder (order) {
    this.storage.setItem(this.key, JSON.stringify(order))
    this.persistedOrder = order
  }

  getLocalOrder () {
    return this.persistedOrder
  }

  restoreOrder () {
    this.emit('sort-order-list', this.persistedOrder)
  }
}
