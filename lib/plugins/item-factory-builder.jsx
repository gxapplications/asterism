'use strict'

import React from 'react'

import AdditionalItem from './additional-item'

class BasicItemFactory {
  constructor ({ localStorage, serverStorage, mainState }) {
    this.context = { localStorage, serverStorage, mainState }
    this.items = this.constructor.generateItems(this)
  }

  static generateItems (itemFactory) {
    // This method is overridden by builder into inherited prototype during build.
    return {}
  }

  getAdditionalItems (category) {
    // here we can filter more depending on the context (if settings required before to show these items)
    return Object.values(this.items).map((i) => i.additionalItem).filter((ai) => ai.category === category)
  }

  instantiateNewItem (additionalItemId, id, settingPanelCallback) {
    return this.saveItem(id, {}, additionalItemId)
    .then(() => this.items[additionalItemId].newInstance(id, settingPanelCallback))
  }

  instantiateItem (id, settingPanelCallback) {
    // must return { item, settingPanel }
    // OR a promise resolving the same structure,
    // OR throw an error with error.status = 404 if not found (other errors won't be caught).
    return this.context.serverStorage.getItem(id)
    .then(({ additionalItemId, params }) => this.items[additionalItemId].restoreInstance(id, params, settingPanelCallback))
  }

  saveItem (id, params, additionalItemId) {
    // must return a Promise that resolves once save is persisted and can be retrieved by a read operation.
    if (!additionalItemId) {
      return this.context.serverStorage.getItem(id)
      .then((data) => this.context.serverStorage.setItem(id, { additionalItemId: data.additionalItemId, params }))
    }
    return this.context.serverStorage.setItem(id, { additionalItemId, params })
  }

  removeItem (id) {
    // This is an async event. Do not return a Promise when finished. Can be overridden.
    console.log(`Ok, item #${id} is removed.`)
  }
}

class ItemTypeBuilder {
  constructor (itemFactoryBuilder, id, category) {
    this.itemFactoryBuilder = itemFactoryBuilder
    this.id = id

    // dev mode only
    if (process.env.NODE_ENV !== 'production') {
      if (this.itemFactoryBuilder.itemsToBuild[this.id]) {
        throw new Error('This additionalItem id already exists.')
      }
    }

    this.category = category
    this.title = id
    this.description = ''
    this.newInstance = null
    this.restoreInstance = null
    this.dimensions = []
  }

  withDescription (title, text) {
    this.title = title
    this.description = text
    return this
  }

  newInstanceWithoutInitialSetting (ItemClass, preferredHeight, preferredWidth, SettingPanelClass) {
    if (this.newInstance) {
      throw new Error('You cannot call newInstance*() multiple times.')
    }
    const typeId = this.id
    this.newInstance = (itemFactory) => (id, settingPanelCallback) => {
      const item = <ItemClass id={id} />
      return {
        id,
        item,
        preferredHeight,
        preferredWidth,
        settingPanel: <SettingPanelClass id={id} item={item}
          save={(newParams) => itemFactory.saveItem(id, newParams, typeId)}
          settingPanelCallback={settingPanelCallback} />
      }
    }
    return this
  }

  newInstanceFromInitialSetting (preferredHeight, preferredWidth, SettingPanelClass) {
    if (this.newInstance) {
      throw new Error('You cannot call newInstance*() multiple times.')
    }
    const typeId = this.id
    this.newInstance = (itemFactory) => (id, settingPanelCallback) => <SettingPanelClass id={id}
      save={(newParams) => itemFactory.saveItem(id, newParams, typeId)} preferredHeight={preferredHeight} preferredWidth={preferredWidth}
        settingPanelCallback={settingPanelCallback} />
    return this
  }

  existingInstance (ItemClass, SettingPanelClass) {
    if (this.restoreInstance) {
      throw new Error('You cannot call restoreInstance() multiple times.')
    }
    const typeId = this.id
    this.restoreInstance = (itemFactory) => (id, params, settingPanelCallback) => {
      const item = <ItemClass id={id} initialParams={params} />
      return {
        item,
        settingPanel: <SettingPanelClass id={id} initialParams={params} item={item}
          save={(newParams) => itemFactory.saveItem(id, newParams, typeId)}
          settingPanelCallback={settingPanelCallback} />
      }
    }
    return this
  }

  acceptDimensions (dimensions) {
    this.dimensions = this.dimensions.concat(dimensions)
    return this
  }

  build () {
    const that = this
    const itemType = (itemFactory) => ({
      additionalItem: new AdditionalItem(
          itemFactory,
          that.id,
          that.title,
          that.category,
          that.description
      ),
      newInstance: this.newInstance(itemFactory),
      restoreInstance: this.restoreInstance(itemFactory),
      dimensions: that.dimensions
    })

    this.itemFactoryBuilder.itemsToBuild[this.id] = itemType
    return this.itemFactoryBuilder
  }
}

class ItemFactoryBuilder {
  constructor () {
    this.itemsToBuild = {}
  }

  newItemType (id, category) {
    return new ItemTypeBuilder(this, id, category)
  }

  build (BaseClass = BasicItemFactory) {
    const that = this
    const itemsInjectorMixin = (Clazz) => class extends Clazz {
      static generateItems (itemFactory) {
        const keys = Object.keys(that.itemsToBuild)
        const items = {}
        keys.forEach((k) => {
          items[k] = that.itemsToBuild[k](itemFactory)
        })
        return items
      }
    }
    return itemsInjectorMixin(BaseClass)
  }
}

export default ItemFactoryBuilder
