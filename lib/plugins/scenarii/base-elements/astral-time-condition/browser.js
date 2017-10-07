'use strict'

import { Scenarii } from 'asterism-plugin-library'

import BrowserAstralTimeConditionEditForm from './edit-form'

const { BrowserCondition } = Scenarii

class BrowserAstralTimeCondition extends BrowserCondition {
  get name () {
    return this.data.name ? `Time limited ${this.data.name}` : `Misconfigured astral time condition`
  }
  get shortLabel () {
    return this.data.name ? `Astral time limit: ${this.data.name}` : this.name
  }
  get fullLabel () {
    return this.data.name ? `Conditions current date & time against astral settings (${this.data.name}).` : this.name
  }

  get EditForm () {
    return BrowserAstralTimeConditionEditForm
  }
}

BrowserAstralTimeCondition.type = Object.assign({}, BrowserCondition.type, {
  name: 'Astral time condition',
  shortLabel: 'Astral time',
  fullLabel: 'Conditions current date & time depending on astral positions, sunrise, sunset, etc...'
})

export default BrowserAstralTimeCondition
