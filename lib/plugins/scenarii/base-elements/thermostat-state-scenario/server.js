'use strict'

import { Scenarii } from 'asterism-plugin-library'
const { ServerScenario } = Scenarii

export default class ServerThermostatStateScenario extends ServerScenario {
  get name () {
    return this.data.name ? `Scenario ${this.data.name}` : `Misconfigured thermostat state scenario`
  }

  trigger (executionId, nextStep = (result) => result) {
  }

  abort (executionId, nextStep = (result) => result) {
  }

  afterUpdate () {
  }
}
