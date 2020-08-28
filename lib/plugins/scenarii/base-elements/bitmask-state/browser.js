'use strict'

import { Scenarii } from 'asterism-plugin-library'

import BrowserBitmaskStateEditForm from './edit-form'

const { BrowserState } = Scenarii

class BrowserBitmaskState extends BrowserState {
  get name () {
    return this.data.name || 'Unnamed bitmask state'
  }

  get shortLabel () {
    return this.data.name ? `State ${this.data.name} (${this.data.state.toString(2).padStart(this.data.count, '0')}/${this.data.state})` : this.name
  }

  get fullLabel () {
    return this.data.name ? `Bitmask state ${this.data.name} (${this.data.count} positions) currently at ${this.data.state.toString(2).padStart(this.data.count, '0')}/${this.data.state}.` : this.name
  }

  get EditForm () {
    return BrowserBitmaskStateEditForm
  }

  get color () {
    return this.data.colors[this.data.state - 1]
  }
}

BrowserBitmaskState.type = Object.assign({}, BrowserState.type, {
  name: 'Bitmask',
  shortLabel: 'Bitmask state',
  fullLabel: 'A state object with up to 8 controlled boolean positions that will trigger events when changed.',
  icon: 'toggle_on'
})

export default BrowserBitmaskState
