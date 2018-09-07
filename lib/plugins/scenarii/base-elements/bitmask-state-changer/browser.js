'use strict'

import { Scenarii } from 'asterism-plugin-library'

import BrowserBitmaskStateChangerEditForm from './edit-form'

const { BrowserAction } = Scenarii

class BrowserBitmaskStateChanger extends BrowserAction {
  get name () {
    return this.data.name ? `State update ${this.data.name}` : `Misconfigured bitmask state update`
  }
  get shortLabel () {
    return this.data.name ? `Bitmask state update: ${this.data.name}` : this.name
  }
  get fullLabel () {
    return this.data.name ? `Updates bitmask state (${this.data.name}) to automatically trigger events.` : this.name
  }

  get EditForm () {
    return BrowserBitmaskStateChangerEditForm
  }
}

BrowserBitmaskStateChanger.type = Object.assign({}, BrowserAction.type, {
  name: 'Bitmask state updater',
  shortLabel: 'Bitmask state updater',
  fullLabel: 'Modifies a bitmask state to a specific value, or increment / decrement it.'
})

export default BrowserBitmaskStateChanger
