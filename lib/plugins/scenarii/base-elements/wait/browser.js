'use strict'

import { Scenarii } from 'asterism-plugin-library'

import BrowserWaitEditForm from './edit-form'

const { BrowserAction } = Scenarii

class BrowserWait extends BrowserAction {
  get name () {
    return this.data.name ? `Wait ${this.data.name}` : `Misconfigured wait timer`
  }
  get shortLabel () {
    return this.data.name ? `Wait timer: ${this.data.name}` : this.name
  }
  get fullLabel () {
    return this.data.name ? `Sleeps before next action (${this.data.name})` : this.name
  }

  get EditForm () {
    return BrowserWaitEditForm
  }
}

BrowserWait.type = Object.assign({}, BrowserAction.type, {
  name: 'Wait',
  shortLabel: 'Wait timer',
  fullLabel: 'Sleeps for time controlled next procedure action.'
})

export default BrowserWait
