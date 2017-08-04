'use strict'

/* global process */
import React from 'react'
import { Item } from 'react-gridifier/dist/materialize'
import uuid from 'uuid'
import OrderHandler from './order-handler'

const getFromId = (id, factories, returnFactory = false) => {
  try {
    const splitId = id.split('~~')
    if (splitId.length !== 2) {
      throw new Error()
    }
    const factoryId = splitId[0]
    const instanceId = splitId[1]
    const factory = factories.find((f) => f.id === factoryId)
    if (returnFactory) {
      return factory
    }
    return factory.instantiateItem(instanceId)
  } catch (error) {
    if (returnFactory) {
      throw error
    }
    return { item: <div>Broken item!</div> }
  }
}

class ItemManager {
  constructor (localStorage, serverStorage, mainComponent) {
    this.localStorage = localStorage
    this.serverStorage = serverStorage
    this.mainComponent = mainComponent
    this.orderHandler = new OrderHandler(
      localStorage,
      'order-handler',
      this.applyServerOrder.bind(this)
    )
  }

  applyServerOrder () {
    this.serverStorage.getItem('order-handler')
    .then((order) => {
      this.orderHandler.setLocalOrder(order || [])
      this.mainComponent.pushItems(this.getAllItems())
      this.orderHandler.restoreOrder()
    })
    .catch((error) => {
      if (error.status !== 404) {
        console.error(error)
      }
    })
  }

  getAllItems () {
    const factories = this.mainComponent.state.itemFactories
    return this.orderHandler.getLocalOrder().map(({ id, w, h }) => {
      return this.encapsulateItem({ id, w, h, ...getFromId(id, factories) })
    })
  }

  encapsulateItem ({ item, id, w = 1, h = 1, settingPanel }) {
    const removeHandler = () => this.removeItem(id)
    const settingsHandler = () => {
      // TODO !1: show settingPanel if not null, in a modal panel ?
    }

    return (
      <Item
        width={w}
        height={h}
        id={id}
        key={id}
        draggable
        removable={!!removeHandler}
        removeHandler={removeHandler}
        settingsHandler={settingsHandler}
      >
        {item}
      </Item>
    )
  }

  addNewItem (item, h, w, settingPanel, factoryId) {
    const instanceId = uuid.v4()
    const id = `${factoryId}~~${instanceId}`

    const items = this.getAllItems()
    items.push(this.encapsulateItem({ item, id, w, h, settingPanel }))
    this.mainComponent.pushItems(items)
  }

  removeItem (id) {
    const items = this.getAllItems()
    this.mainComponent.pushItems(items.filter((i) => i.props.id !== id))

    // async event sent to itemFactory
    const factories = this.mainComponent.state.itemFactories
    const factory = getFromId(id, factories, true)
    factory.removeItem(id)
  }
}

export default ItemManager
