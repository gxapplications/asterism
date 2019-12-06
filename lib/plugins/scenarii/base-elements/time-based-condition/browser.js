'use strict'

import { Scenarii } from 'asterism-plugin-library'

import BrowserTimeBasedConditionEditForm from './edit-form'

const { BrowserCondition } = Scenarii

class BrowserTimeBasedCondition extends BrowserCondition {
  get name () {
    return this.data.name ? `Time limited ${this.data.name}` : `Misconfigured time based condition`
  }
  get shortLabel () {
    return this.data.name ? `Date & time limit: ${this.data.name}` : this.name
  }
  get fullLabel () {
    return this.data.name ? `Conditions current date & time against specific settings (${this.data.name}).` : this.name
  }

  get EditForm () {
    return BrowserTimeBasedConditionEditForm
  }
}

BrowserTimeBasedCondition.type = Object.assign({}, BrowserCondition.type, {
  name: 'Time based condition',
  shortLabel: 'Time based',
  fullLabel: 'Conditions current date & time.',
  icon: 'schedule'
})

export default BrowserTimeBasedCondition
