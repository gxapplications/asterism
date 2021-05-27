'use strict'

import { Scenarii } from 'asterism-plugin-library'
const { ServerScenario } = Scenarii

export default class ServerSurveyScenario extends ServerScenario {
  constructor (data) {
    super(data)

    this.arming = false
    this.armingTimer = null
    this.level = 1
    this._forceLevelStateListenerId = null
  }

  get name () {
    return this.data.name ? `Survey ${this.data.name}` : 'Misconfigured survey scenario'
  }

  _resetLevelState () {
    return ServerSurveyScenario.scenariiService.getStateInstance(this.data.levelStateId)
      .then((levelState) => {
        if (!levelState) {
          ServerSurveyScenario.logger.warning('Level state update action failed:  not found.')
          throw new Error('Level state update action failed: not found.')
        }
        levelState.state = 1
        this.level = 1
        return true
      })
  }

  requestSoftActivation (value, immediately = false) {
    if (this.armingTimer) {
      clearTimeout(this.armingTimer)
    }
    if (!value || immediately === true) { // instant (de)activation
      this.activated = value
      this.arming = false
      return this._resetLevelState().then(() => true)
    }
    // delayed activation
    this._resetLevelState() // async, do not wait for it, not needed
    this.arming = true
    // TODO !3: must check armingConditionsToNotice: if one of them is true, then must suspend arming process and wait for user confirmation.
    return new Promise((resolve) => {
      this.armingTimer = setTimeout(() => {
        if (this.arming) {
          this.activated = true
          this.arming = false
          this._resetLevelState().then(() => resolve(true))
        } else {
          resolve(true)
        }
      }, this.data.armingDelay * 1000)
    })
  }

  trigger (executionId, nextStep = (result) => result) {
    const triggerChain = (result) => {
      if (!result) {
        return result
      }

      return Promise.resolve().then(nextStep)
    }

    return super.trigger(executionId, triggerChain)
  }

  abort (executionId, nextStep = (result) => result) {
    const abortChain = (result) => {
      if (!result) {
        return result
      }
      return this._resetLevelState().then(nextStep)
    }

    return super.abort(executionId, abortChain)
  }

  afterUpdate () {
    // async way, no need to wait blocker function to be ready
    ServerSurveyScenario.scenariiService.getStateInstance(this.data.levelStateId)
      .then((levelState) => {
        if (!levelState) {
          ServerSurveyScenario.logger.warning('Level state update action failed:  not found.')
          return Promise.reject(new Error('Level state update action failed: not found.'))
        }
        if (this._forceLevelStateListenerId) {
          levelState.removeListener(this._forceLevelStateListenerId)
        }
        if (this.activated) {
          const listener = (state, s, oldState) => {}
          listener.preValidate = (state, s, oldState) => {
            return state === this.level
          }
          this._forceLevelStateListenerId = levelState.addListener(listener)
        }
      })

    // TODO !2: remove listeners on triggers

    if (!this.activated) {
      return Promise.resolve(true)
    }

    // TODO !2: add listeners on triggers
    return Promise.resolve(true)
  }
}
