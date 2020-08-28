'use strict'

import { Scenarii } from 'asterism-plugin-library'

import BrowserFloatingLevelStateEditForm from './edit-form'

const { BrowserState } = Scenarii

class BrowserFloatingLevelState extends BrowserState {
  get name () {
    return this.data.name || 'Unnamed floating level state'
  }

  get shortLabel () {
    return this.data.name ? `State ${this.data.name} (${this.data.state})` : this.name
  }

  get fullLabel () {
    return this.data.name ? `Floating level state ${this.data.name} [${this.data.min}-${this.data.max}] currently at ${this.data.state}.` : this.name
  }

  get EditForm () {
    return BrowserFloatingLevelStateEditForm
  }
}

BrowserFloatingLevelState.type = Object.assign({}, BrowserState.type, {
  name: 'Floating level',
  shortLabel: 'Floating level state',
  fullLabel: 'A state object with floating value that can trigger events when changed.',
  icon: 'speed'
})

export default BrowserFloatingLevelState
