'use strict'

import { Scenarii } from 'asterism-plugin-library'

import BrowserThermostatStateScenarioEditForm from './edit-form'

const { BrowserScenario } = Scenarii

class BrowserThermostatStateScenario extends BrowserScenario {
  get name () {
    return this.data.name ? `Thermostat ${this.data.name}` : 'Misconfigured thermostat state scenario'
  }

  get shortLabel () {
    return this.data.name ? `Thermostat state scenario (${this.data.name})` : this.name
  }

  get fullLabel () {
    return this.data.name ? `Drives a state as thermostat (${this.data.name}).` : this.name
  }

  get EditForm () {
    return BrowserThermostatStateScenarioEditForm
  }
}

BrowserThermostatStateScenario.type = Object.assign({}, BrowserScenario.type, {
  name: 'Thermostat state scenario',
  shortLabel: 'Thermostat state scenario',
  fullLabel: 'Level state controlled by a programmable thermostat, temperature controlled or eco modes.',
  icon: 'filter_tilt_shift'
})

export default BrowserThermostatStateScenario
