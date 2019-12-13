'use strict'

import { Scenarii } from 'asterism-plugin-library'

import BrowserLevelStateConditionEditForm from './edit-form'

const { BrowserCondition } = Scenarii

class BrowserLevelStateCondition extends BrowserCondition {
  get name () {
    return this.data.name ? `State ${this.data.name}` : `Misconfigured level state condition`
  }
  get shortLabel () {
    return this.data.name ? `Level state: ${this.data.name}` : this.name
  }
  get fullLabel () {
    return this.data.name ? `Level state matches condition (${this.data.name}).` : this.name
  }

  get EditForm () {
    return BrowserLevelStateConditionEditForm
  }
}

BrowserLevelStateCondition.type = Object.assign({}, BrowserCondition.type, {
  name: 'Level state condition',
  shortLabel: 'Level state',
  fullLabel: 'Conditions level state matching specific equation',
  icon: 'speed'
})

export default BrowserLevelStateCondition
