'use strict'

import uuid from 'uuid'

class AdditionalItem {
  constructor (itemFactory, id, name, category, description, icon) {
    this.itemFactory = itemFactory
    this.id = id
    this.name = name
    this.category = category
    this.description = description
    this.icon = icon
  }

  instantiateNewItem (settingPanelCallback, instanceId = uuid.v4()) {
    return this.itemFactory.instantiateNewItem(this.id, `${this.itemFactory.id}~~${instanceId}`, settingPanelCallback)
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
