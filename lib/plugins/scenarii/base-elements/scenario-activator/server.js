'use strict'

import { Scenarii } from 'asterism-plugin-library'
const { ServerAction } = Scenarii

export default class ServerScenarioActivator extends ServerAction {
  get name () {
    const verb = (this.data.operation === 'activate') ? 'Activation' : ((this.data.operation === 'deactivate') ? 'Deactivation' : 'Switches')
    return this.data.name ? `${verb} of ${this.data.name}` : `Misconfigured scenario activator`
  }

  execute (executionId) {
    return ServerScenarioActivator.scenariiService.getScenarioInstance(this.data.scenarioId)
    .then((scenario) => {
      switch (this.data.operation) {
        case 'activate':
          return ServerScenarioActivator.scenariiService.setActivationScenarioInstance(scenario, true)
        case 'deactivate':
          return ServerScenarioActivator.scenariiService.setActivationScenarioInstance(scenario, false)
        case 'switch':
        default:
          const activation = scenario.activated
          return ServerScenarioActivator.scenariiService.setActivationScenarioInstance(scenario, !activation)
      }
    })
  }
}
