'use strict'

import { Scenarii } from 'asterism-plugin-library'

import BrowserScenarioAborterEditForm from './edit-form'

const { BrowserAction } = Scenarii

class BrowserScenarioAborter extends BrowserAction {
  get name () {
    return this.data.name ? `Abort ${this.data.name}` : 'Misconfigured scenario aborter'
  }

  get shortLabel () {
    return this.data.name ? `Scenario aborter ${this.data.name}` : this.name
  }

  get fullLabel () {
    return this.data.name ? `Aborts all executions of a scenario (${this.data.name}).` : this.name
  }

  get EditForm () {
    return BrowserScenarioAborterEditForm
  }
}

BrowserScenarioAborter.type = Object.assign({}, BrowserAction.type, {
  name: 'Scenario aborter',
  shortLabel: 'Scenario aborter',
  fullLabel: 'Abort all executions of a scenario.',
  icon: 'highlight_off'
})

export default BrowserScenarioAborter
