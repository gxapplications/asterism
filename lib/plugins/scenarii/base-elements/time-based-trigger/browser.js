'use strict'

import { Scenarii } from 'asterism-plugin-library'

import BrowserTimeBasedTriggerEditForm from './edit-form'

const { BrowserTrigger } = Scenarii

class BrowserTimeBasedTrigger extends BrowserTrigger {
  get name () {
    return this.data.name ? `Time reached ${this.data.name}` : `Misconfigured time based trigger`
  }
  get shortLabel () {
    return this.data.name ? `Date & time reached: ${this.data.name}` : this.name
  }
  get fullLabel () {
    return this.data.name ? `Triggers when date & time reached specific settings (${this.data.name}).` : this.name
  }

  get EditForm () {
    return BrowserTimeBasedTriggerEditForm
  }
}

BrowserTimeBasedTrigger.type = Object.assign({}, BrowserTrigger.type, {
  name: 'Time based trigger',
  shortLabel: 'Time based',
  fullLabel: 'Triggers at the right date & time.'
})

export default BrowserTimeBasedTrigger
