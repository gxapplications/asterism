'use strict'

class AdditionalItem {
  constructor (itemFactory, id, name, category, description, icon) {
    this.itemFactory = itemFactory
    this.id = id
    this.name = name
    this.category = category
    this.description = description
    this.icon = icon
  }

  instantiateNewItem () {
    return this.itemFactory.instantiateNewItem(this.id)
  }
}

AdditionalItem.categories = {
  DOMOTICS: 'domotics',
  SECURITY: 'security',
  SCREENING: 'screening',
  COMMUNICATION: 'communication',
  INFORMATION: 'information',
  DEVELOPMENT: 'development'
}

export default AdditionalItem
