'use strict'

import cron from 'cron'

import { Scenarii } from 'asterism-plugin-library'
const { ServerScenario } = Scenarii

export default class ServerThermostatStateScenario extends ServerScenario {
  constructor (data) {
    super(data)
    this._currentProgram = null
  }

  destroy () {
    this._cron && this._cron.stop()
  }

  get name () {
    return this.data.name ? `Thermostat ${this.data.name}` : `Misconfigured thermostat state scenario`
  }

  trigger (executionId, nextStep = (result) => result) {
    this._nextStep()
    return super.trigger(executionId, () => Promise.resolve(true).then(nextStep))
  }

  abort (executionId, nextStep = (result) => result) {
    return super.abort(executionId, () => Promise.resolve(true).then(nextStep))
  }

  afterUpdate () {
    if (!this._cron) {
      const CronJob = cron.CronJob
      this._cron = new CronJob('2 0,10,20,30,40,50 * * * *', this._nextStep.bind(this), null, true)
    }
    // TODO !1: support of temperature (floating state) to drive (need to listen to the state...)
    this._nextStep()
  }

  _resetForceMode () {
    ServerThermostatStateScenario.logger.info(`Force mode for ${this.name} will end now.`)
    this.data.forceModeEnd = false
    ServerThermostatStateScenario.scenariiService.setScenarioInstance(this)
    ServerThermostatStateScenario.scenariiService.privateSocket.emit('scenarioThermostatStateChanged', { instanceId: this.instanceId, data: this.data })
  }

  _resetOverriddenProgram () {
    ServerThermostatStateScenario.logger.info(`Overridden program for ${this.name} is reset now.`)
    this.data.overriddenProgram = false
    this.data.overrideEnd = false
    ServerThermostatStateScenario.scenariiService.setScenarioInstance(this)
    ServerThermostatStateScenario.scenariiService.privateSocket.emit('scenarioThermostatStateChanged', { instanceId: this.instanceId, data: this.data })
  }

  _nextStep () {
    if (!this || !this.data) { return }
    const { forceModeEnd, overrideEnd, program, overriddenProgram, activated, stateId, highLevel, lowLevel, offLevel, name } = this.data
    // console.log('_nextStep called', forceModeEnd, overrideEnd)

    // Need to end Force mode ?
    if (forceModeEnd && forceModeEnd < Date.now()) {
      // console.log('_nextStep forceModeEnd to clean')
      return this._resetForceMode()
      // nothing more, save will trigger afterUpdate method again, in async.
    }

    // Need to cancel overridden program ?
    if (overrideEnd && overrideEnd < Date.now()) {
      // console.log('_nextStep overrideEnd to clean')
      return this._resetOverriddenProgram()
      // nothing more, save will trigger afterUpdate method again, in async.
    }

    // Run program
    if (!activated || !stateId) {
      ServerThermostatStateScenario.scenariiService.privateSocket.emit('scenarioThermostatStateChanged', { instanceId: this.instanceId, data: this.data })
      return
    }

    // Find current program
    const now = new Date()
    const dayProgram = overriddenProgram || program[now.getDay()]
    const currentProgram = (forceModeEnd && forceModeEnd > Date.now()) ? 1 : dayProgram[(now.getHours() * 2) + (now.getMinutes() >= 30 ? 1 : 0)]
    // console.log('_nextStep 1. AT:', now, 'dayProgramIndex:', (now.getHours() * 2) + (now.getMinutes() >= 30 ? 1 : 0), this._currentProgram, currentProgram)

    if (currentProgram === this._currentProgram) {
      ServerThermostatStateScenario.scenariiService.privateSocket.emit('scenarioThermostatStateChanged', { instanceId: this.instanceId, data: this.data })
      return
    }

    return ServerThermostatStateScenario.scenariiService.getStateInstance(stateId)
    .then((levelState) => {
      if (!levelState) {
        ServerThermostatStateScenario.logger.warning(`Level state: ${name} not found.`)
        return
      }

      this._currentProgram = currentProgram

      ServerThermostatStateScenario.logger.info(`Program for ${name} will change state to ${currentProgram === 1 ? 'high' : (currentProgram === 0 ? 'low' : 'off')}`)
      // console.log('_nextStep 2. currentProgram:', currentProgram)
      switch (currentProgram) {
        case 1:
          levelState.state = highLevel
          break
        case 0:
          levelState.state = lowLevel
          break
        case -1:
          levelState.state = offLevel
          break
        default:
          ServerThermostatStateScenario.logger.warn(`Program for ${name} is broken.`)
      }

      // TODO !1: support of temperature (floating state) to drive (need to listen to the state...)

      ServerThermostatStateScenario.scenariiService.privateSocket.emit('scenarioThermostatStateChanged', { instanceId: this.instanceId, data: this.data })
    })
    .catch((error) => {
      ServerThermostatStateScenario.logger.error(error)
      ServerThermostatStateScenario.scenariiService.privateSocket.emit('scenarioThermostatStateChanged', { instanceId: this.instanceId, data: this.data })
    })
  }
}
