'use strict'

import { Scenarii } from 'asterism-plugin-library'

import BrowserBitmaskStateTriggerEditForm from './edit-form'

const { BrowserTrigger } = Scenarii

class BrowserBitmaskStateTrigger extends BrowserTrigger {
  get name () {
    return this.data.name ? `State ${this.data.name}` : 'Misconfigured bitmask state trigger'
  }

  get shortLabel () {
    return this.data.name ? `Bitmask state changed: ${this.data.name}` : this.name
  }

  get fullLabel () {
    return this.data.name ? `Triggers when the bitmask state changes (${this.data.name}).` : this.name
  }

  get EditForm () {
    return BrowserBitmaskStateTriggerEditForm
  }
}

BrowserBitmaskStateTrigger.type = Object.assign({}, BrowserTrigger.type, {
  name: 'Bitmask state trigger',
  shortLabel: 'Bitmask state',
  fullLabel: 'Triggers when a bitmask state changes.',
  icon: 'toggle_on'
})

export default BrowserBitmaskStateTrigger
