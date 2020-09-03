'use strict'

import { Scenarii } from 'asterism-plugin-library'

import BrowserBitmaskStateConditionEditForm from './edit-form'

const { BrowserCondition } = Scenarii

class BrowserBitmaskStateCondition extends BrowserCondition {
  get name () {
    return this.data.name ? `State ${this.data.name}` : 'Misconfigured bitmask state condition'
  }

  get shortLabel () {
    return this.data.name ? `Bitmask state: ${this.data.name}` : this.name
  }

  get fullLabel () {
    return this.data.name ? `Bitmask state matches condition (${this.data.name}).` : this.name
  }

  get EditForm () {
    return BrowserBitmaskStateConditionEditForm
  }
}

BrowserBitmaskStateCondition.type = Object.assign({}, BrowserCondition.type, {
  name: 'Bitmask state condition',
  shortLabel: 'Bitmask state',
  fullLabel: 'Conditions bitmask state matching specific equation',
  icon: 'toggle_on'
})

export default BrowserBitmaskStateCondition
