'use strict'

import { Scenarii } from 'asterism-plugin-library'

import BrowserHttpCallTriggerEditForm from './edit-form'

const { BrowserTrigger } = Scenarii

class BrowserHttpCallTrigger extends BrowserTrigger {
  get name () {
    return this.data.name ? `Insecure HTTP call ${this.data.name}` : 'Misconfigured insecure HTTP call trigger'
  }

  get shortLabel () {
    return this.data.name ? `Insecure HTTP call: ${this.data.name}` : this.name
  }

  get fullLabel () {
    return this.data.name ? `Triggers when a matching insecure HTTP call is received (${this.data.name}).` : this.name
  }

  get EditForm () {
    return BrowserHttpCallTriggerEditForm
  }
}

BrowserHttpCallTrigger.type = Object.assign({}, BrowserTrigger.type, {
  name: 'Insecure HTTP call trigger',
  shortLabel: 'Insecure HTTP call',
  fullLabel: 'Triggers with an insecure HTTP call.',
  icon: 'http'
})

export default BrowserHttpCallTrigger
