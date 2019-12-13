'use strict'

import { Scenarii } from 'asterism-plugin-library'

import BrowserScenarioActivatorEditForm from './edit-form'

const { BrowserAction } = Scenarii

class BrowserScenarioActivator extends BrowserAction {
  get name () {
    const verb = (this.data.operation === 'activate') ? 'Activation' : ((this.data.operation === 'deactivate') ? 'Deactivation' : 'Switches')
    return this.data.name ? `${verb} of ${this.data.name}` : `Misconfigured scenario activator`
  }
  get shortLabel () {
    const verb = (this.data.operation === 'activate') ? 'activation' : ((this.data.operation === 'deactivate') ? 'deactivation' : 'switch')
    return this.data.name ? `Scenario ${verb} for ${this.data.name}` : this.name
  }
  get fullLabel () {
    const verb = (this.data.operation === 'activate') ? 'Ensures scenario can be played' : ((this.data.operation === 'deactivate') ? 'Prevents scenario to be played' : 'Switches scenario activation state')
    return this.data.name ? `${verb} (${this.data.name}).` : this.name
  }

  get EditForm () {
    return BrowserScenarioActivatorEditForm
  }
}

BrowserScenarioActivator.type = Object.assign({}, BrowserAction.type, {
  name: 'Scenario activator',
  shortLabel: 'Scenario activator',
  fullLabel: 'Activate / deactivate a scenario.',
  icon: 'play_circle_outline'
})

export default BrowserScenarioActivator
