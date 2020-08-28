'use strict'

import { Scenarii } from 'asterism-plugin-library'

import BrowserHttpCallTriggerEditForm from './edit-form'

const { BrowserTrigger } = Scenarii

class BrowserHttpCallTrigger extends BrowserTrigger {
  get name () {
    return this.data.name ? `HTTP call ${this.data.name}` : 'Misconfigured HTTP call trigger'
  }

  get shortLabel () {
    return this.data.name ? `HTTP call: ${this.data.name}` : this.name
  }

  get fullLabel () {
    return this.data.name ? `Triggers when a matching HTTP call is received (${this.data.name}).` : this.name
  }

  get EditForm () {
    return BrowserHttpCallTriggerEditForm
  }
}

BrowserHttpCallTrigger.type = Object.assign({}, BrowserTrigger.type, {
  name: 'HTTP call trigger',
  shortLabel: 'HTTP call',
  fullLabel: 'Triggers with an HTTP call.',
  icon: 'http'
})

export default BrowserHttpCallTrigger
