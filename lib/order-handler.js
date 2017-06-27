'use strict'

import EventEmitter from 'events'

export default class AutoStorage extends EventEmitter {
  constructor (storage, key) {
    super()
    this.storage = storage
    this.key = key
    const storeContent = this.storage.getItem(this.key)
    this.persistedOrder = storeContent ? JSON.parse(storeContent) : []
  }

  parseGridChildren (gridNode) {
    const children = []
    for (const i of gridNode.children) {
      children.push({ id: i.id, guid: i.attributes['data-gridifier-guid'].value })
    }
    return children.sort((a, b) => {
      return a.guid - b.guid
    })
  }

  onChange (gridNode) {
    const order = this.parseGridChildren(gridNode)
    this.persistOrder(order)
  }

  persistOrder (order) {
    this.storage.setItem(this.key, JSON.stringify(order))
    this.persistedOrder = order
  }

  restoreOrder () {
    this.emit('sort-order-list', this.persistedOrder)
  }
}
