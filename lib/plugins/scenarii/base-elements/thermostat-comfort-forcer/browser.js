'use strict'

import { Scenarii } from 'asterism-plugin-library'

import ThermostatComfortForcerEditForm from './edit-form'

const { BrowserAction } = Scenarii

class BrowserThermostatComfortForcer extends BrowserAction {
  get name () {
    return this.data.name ? `Thermostat comfort forcer ${this.data.name}` : 'Misconfigured thermostat comfort forcer'
  }

  get shortLabel () {
    return this.data.name ? `Thermostat comfort forcer: ${this.data.name}` : this.name
  }

  get fullLabel () {
    return this.data.name ? `Forces thermostat to comfort mode (${this.data.name}) for 2 hours.` : this.name
  }

  get EditForm () {
    return ThermostatComfortForcerEditForm
  }
}

BrowserThermostatComfortForcer.type = Object.assign({}, BrowserAction.type, {
  name: 'Thermostat comfort forcer',
  shortLabel: 'Thermostat comfort forcer',
  fullLabel: 'Forces comfort mode for a specific thermostat.',
  icon: 'brightness_low'
})

export default BrowserThermostatComfortForcer
