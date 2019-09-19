'use strict'

import moment from 'moment'
import 'moment-timer'

import { Scenarii } from 'asterism-plugin-library'
const { ServerScenario } = Scenarii

export default class ServerThermostatStateScenario extends ServerScenario {
  constructor (data) {
    super(data)
    this._nextHalfHourTimer(this._nextStep.bind(this))
    this._currentProgram = null
  }

  get name () {
    return this.data.name ? `Thermostat ${this.data.name}` : `Misconfigured thermostat state scenario`
  }

  trigger (executionId, nextStep = (result) => result) {
    this.afterUpdate()
  }

  abort (executionId, nextStep = (result) => result) { }

  _resetForceMode () {
    ServerThermostatStateScenario.logger.info(`Force mode for ${this.name} will end now.`)
    this.data.forceModeEnd = false
    ServerThermostatStateScenario.scenariiService.setScenarioInstance(this)
    console.log(this.data)
    ServerThermostatStateScenario.scenariiService.privateSocket.emit('scenarioThermostatStateChanged', { instanceId: this.instanceId, data: this.data })
  }

  _tomorrowTimer (callback) { // in 24hrs, but stuck to previous half hour, 1 second before
    const now = moment()
    now.millisecond(0)
    const tomorrow = now.clone()
    tomorrow.add(1, 'days')
    tomorrow.minutes(tomorrow.minutes() > 30 ? 30 : 0)
    tomorrow.seconds(0)
    tomorrow.subtract(1, 'seconds')
    return moment.duration(tomorrow.diff(now)).timer({ start: true, loop: false }, callback)
  }

  _nextHalfHourTimer (callback) { // next rounded half hour
    const now = moment()
    now.millisecond(0)
    const next = now.clone()
    next.seconds(0)

    if (next.minutes() < 30) {
      next.minutes(30)
    } else {
      next.add(1, 'hours')
      next.minutes(0)
    }
    const duration = moment.duration(next.diff(now))
    const timer = duration.timer({ start: false, loop: false }, callback)
    timer.start()
  }

  _resetOverriddenProgram () {
    ServerThermostatStateScenario.logger.info(`Overridden program for ${this.name} is reset now.`)
    this.data.overriddenProgram = false
    this.overriddenProgramReseter = false
    ServerThermostatStateScenario.scenariiService.setScenarioInstance(this)
    ServerThermostatStateScenario.scenariiService.privateSocket.emit('scenarioThermostatStateChanged', { instanceId: this.instanceId, data: this.data })
  }

  _nextStep () {
    const { forceModeEnd, program, overriddenProgram, activated, stateId, highLevel, lowLevel, offLevel, name } = this.data
    if (!activated || !stateId) {
      return
    }

    const now = new Date()
    const dayProgram = overriddenProgram || program[now.getDay()]
    const currentProgram = (forceModeEnd && forceModeEnd > Date.now()) ? 1 : dayProgram[(now.getHours() * 2) + (now.getMinutes() > 30 ? 1 : 0)]

    if (currentProgram === this._currentProgram) {
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
      switch (currentProgram) {
        // levelState.state setter is protected for extra boundaries
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
    })
  }

  afterUpdate () {
    const { forceModeEnd, overriddenProgram } = this.data

    if (forceModeEnd) {
      if (forceModeEnd < Date.now()) {
        return this._resetForceMode()
        // nothing more, save will trigger afterUpdate method again, in async.
      } else {
        moment.duration(forceModeEnd - Date.now()).timer({ start: true }, this._resetForceMode.bind(this))
      }
    }

    if (overriddenProgram && !this.overriddenProgramReseter) {
      ServerThermostatStateScenario.logger.info(`Overridden program for ${this.name} will be reset in 24hrs.`)

      this.overriddenProgramReseter = true
      this._tomorrowTimer(this._resetOverriddenProgram.bind(this))
    }

    // TODO !1: support of temperature (floating state) to drive (need to listen to the state...)

    this._nextStep()
  }
}
