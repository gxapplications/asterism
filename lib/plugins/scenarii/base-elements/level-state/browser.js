'use strict'

import { Scenarii } from 'asterism-plugin-library'

import BrowserLevelStateEditForm from './edit-form'

const { BrowserState } = Scenarii

class BrowserLevelState extends BrowserState {
  get name () {
    return this.data.name || 'Unnamed level state'
  }
  get shortLabel () {
    return this.data.name ? `State ${this.data.name} (${this.data.state})` : this.name
  }
  get fullLabel () {
    return this.data.name ? `Level state ${this.data.name} [1-${this.data.max}] currently at ${this.data.state}` : this.name
  }

  get EditForm () {
    return BrowserLevelStateEditForm
  }

  get color () {
    return this.data.colors[this.data.state - 1]
  }
}

BrowserLevelState.type = Object.assign({}, BrowserState.type, {
  name: 'Level',
  shortLabel: 'Level state',
  fullLabel: 'A state object with controlled level that will trigger events when changed'
})

export default BrowserLevelState
