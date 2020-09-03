'use strict'

import { Scenarii } from 'asterism-plugin-library'

import BrowserAstralTimeTriggerEditForm from './edit-form'

const { BrowserTrigger } = Scenarii

class BrowserAstralTimeTrigger extends BrowserTrigger {
  get name () {
    return this.data.name ? `Time reached ${this.data.name}` : 'Misconfigured astral time trigger'
  }

  get shortLabel () {
    return this.data.name ? `Astral time reached: ${this.data.name}` : this.name
  }

  get fullLabel () {
    return this.data.name ? `Triggers when date & time reached astral settings (${this.data.name}).` : this.name
  }

  get EditForm () {
    return BrowserAstralTimeTriggerEditForm
  }
}

BrowserAstralTimeTrigger.type = Object.assign({}, BrowserTrigger.type, {
  name: 'Astral time trigger',
  shortLabel: 'Astral time',
  fullLabel: 'Triggers depending on astral positions, sunrise, sunset, etc...',
  icon: 'brightness_4'
})

export default BrowserAstralTimeTrigger
