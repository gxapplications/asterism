'use strict'

import { Scenarii } from 'asterism-plugin-library'

import BrowserLevelStateChangerEditForm from './edit-form'

const { BrowserAction } = Scenarii

class BrowserLevelStateChanger extends BrowserAction {
  get name () {
    return this.data.name ? `Level state ${this.data.name}` : `Misconfigured level state update`
  }
  get shortLabel () {
    return this.data.name ? `Level state update: ${this.data.name}` : this.name
  }
  get fullLabel () {
    return this.data.name ? `Updates level state (${this.data.name}) to automatically trigger events` : this.name
  }

  get EditForm () {
    return BrowserLevelStateChangerEditForm
  }
}

BrowserLevelStateChanger.type = Object.assign({}, BrowserAction.type, {
  name: 'Level state updater',
  shortLabel: 'Level state updater',
  fullLabel: 'Modifies a level state to a specific value, or increment / decrement it.'
})

export default BrowserLevelStateChanger
