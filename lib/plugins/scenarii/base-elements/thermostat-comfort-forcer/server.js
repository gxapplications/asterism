'use strict'

import { Scenarii } from 'asterism-plugin-library'
const { ServerAction } = Scenarii

export default class ServerThermostatComfortForcer extends ServerAction {
  get name () {
    return this.data.name ? `Thermostat comfort forcer ${this.data.name}` : 'Misconfigured thermostat comfort forcer'
  }

  execute (executionId) {
    return ServerThermostatComfortForcer.scenariiService.getScenarioInstance(this.data.thermostatStateScenarioId)
      .then((thermostatStateScenario) => {
        if (!thermostatStateScenario) {
          ServerThermostatComfortForcer.logger.warning(`Thermostat comfort forcer action failed: ${this.data.name} not found.`)
          return Promise.reject(new Error(`Thermostat comfort forcer action failed: ${this.data.name} not found.`))
        }

        thermostatStateScenario.data.forceModeEnd = Date.now() + (2 * 3600 * 1000)
        return ServerThermostatComfortForcer.scenariiService
          .setScenarioData(thermostatStateScenario, thermostatStateScenario.group)
          .then(() => true)
      })
  }
}
