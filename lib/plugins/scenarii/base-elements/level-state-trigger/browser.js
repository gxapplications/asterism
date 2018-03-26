'use strict'

import { Scenarii } from 'asterism-plugin-library'

import BrowserLevelStateTriggerEditForm from './edit-form'

const { BrowserTrigger } = Scenarii

class BrowserLevelStateTrigger extends BrowserTrigger {
  get name () {
    return this.data.name ? `State ${this.data.name}` : `Misconfigured level state trigger`
  }
  get shortLabel () {
    return this.data.name ? `Level state changed: ${this.data.name}` : this.name
  }
  get fullLabel () {
    return this.data.name ? `Triggers when the level state changes (${this.data.name}).` : this.name
  }

  get EditForm () {
    return BrowserLevelStateTriggerEditForm
  }
}

BrowserLevelStateTrigger.type = Object.assign({}, BrowserTrigger.type, {
  name: 'Level state trigger',
  shortLabel: 'Level state',
  fullLabel: 'Triggers when a level state changes.'
})

export default BrowserLevelStateTrigger
