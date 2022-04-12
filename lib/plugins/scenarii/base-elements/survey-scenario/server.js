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
    this.manualTriggerTimer = null
    this.warningActionExecutions = []
    this.alarmingActionExecutions = []

    this.raisingTriggersListened = {}
    this.raisingTriggerTimers = {}
    this.deactivationTriggersListened = {}
  }

  get name () {
    return this.data.name ? `Survey ${this.data.name}` : 'Misconfigured survey scenario'
  }

  _setLevelState (level) {
    return ServerSurveyScenario.scenariiService.getStateInstance(this.data.levelStateId)
      .then((levelState) => {
        if (!levelState) {
          ServerSurveyScenario.logger.warning('Level state update action failed: not found.')
          throw new Error('Level state update action failed: not found.')
        }

        levelState.state = level

        // from old level > 2 to new level <=2
        if (level <= 2 && this.level > 2) {
          // Execution of deactivation actions, async way
          this.data.deactivationActions.map((deactivationActionId, idx) => {
            ServerSurveyScenario.scenariiService.getActionInstance(deactivationActionId)
              .then((action) => {
                if (!action) {
                  ServerSurveyScenario.logger.warn(`Scenario ${this.data.name}: Action not found!`)
                  return
                }
                ServerSurveyScenario.scenariiService.executeActionData(action)
              })
          })

          for (const k in this.raisingTriggerTimers) {
            if (this.raisingTriggerTimers[k]) {
              clearTimeout(this.raisingTriggerTimers[k])
              this.raisingTriggerTimers[k] = null
            }
          }

          // Cancel executing actions if still any
          this.warningActionExecutions.filter(e => e && e.length).forEach(([executionId, action]) => {
            ServerSurveyScenario.scenariiService.abortActionData(action, executionId)
          })
          this.warningActionExecutions = []
          this.alarmingActionExecutions.filter(e => e && e.length).forEach(([executionId, action]) => {
            ServerSurveyScenario.scenariiService.abortActionData(action, executionId)
          })
          this.alarmingActionExecutions = []

          this.level = level
          return levelState
        }

        if (levelState.data.max >= 4 && level === 3) {
          // Execution of warning actions, async way
          const executionIdPrefix = `survey-${this.data.levelStateId}-warn-actions-`
          this.data.warningActions.map((warningActionId, idx) => {
            ServerSurveyScenario.scenariiService.getActionInstance(warningActionId)
              .then((action) => {
                if (!action) {
                  ServerSurveyScenario.logger.warn(`Scenario ${this.data.name}: Action not found!`)
                  return
                }
                this.warningActionExecutions[idx] = [executionIdPrefix + idx, action]
                ServerSurveyScenario.scenariiService.executeActionData(action, this.warningActionExecutions[idx][0])
                  .finally(() => {
                    this.warningActionExecutions[idx] = null
                  })
              })
          })

          this.level = level
          return levelState
        }

        if (levelState.data.max >= 3 && level >= 3) {
          // Execution of alarming actions, async way
          const executionIdPrefix = `survey-${this.data.levelStateId}-alarm-actions-`
          this.data.alarmingActions.map((alarmingActionId, idx) => {
            ServerSurveyScenario.scenariiService.getActionInstance(alarmingActionId)
              .then((action) => {
                if (!action) {
                  ServerSurveyScenario.logger.warn(`Scenario ${this.data.name}: Action not found!`)
                  return
                }
                this.alarmingActionExecutions[idx] = [executionIdPrefix + idx, action]
                ServerSurveyScenario.scenariiService.executeActionData(action, this.alarmingActionExecutions[idx][0])
                  .finally(() => {
                    this.alarmingActionExecutions[idx] = null
                  })
              })
          })

          this.level = level
          return levelState
        }

        this.level = level
        return levelState
      })
  }

  requestSoftActivation (value, immediately = false) {
    if (this.armingTimer) {
      clearTimeout(this.armingTimer)
    }
    if (!value || immediately === true) { // instant (de)activation
      this.activated = value
      this.arming = false
      return this._setLevelState(value ? 2 : 1).then(() => true)
    }
    // delayed activation
    this._setLevelState(1) // async, do not wait for it, not needed
    this.arming = true

    // TODO !1: must check armingConditionsToNotice: if one of them is true,
    //  then must suspend arming process and wait for user confirmation ?

    // Execution of arming actions, async way
    this.data.armingActions.map((armingActionId, idx) => {
      ServerSurveyScenario.scenariiService.getActionInstance(armingActionId)
        .then((action) => {
          if (!action) {
            ServerSurveyScenario.logger.warn(`Scenario ${this.data.name}: Action not found!`)
            return
          }
          ServerSurveyScenario.scenariiService.executeActionData(action)
        })
    })

    return new Promise((resolve) => {
      this.armingTimer = setTimeout(() => {
        if (this.arming) {
          this.activated = true
          this.arming = false
          this._setLevelState(2).then(() => resolve(true))
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

      return new Promise((resolve) => {
        this._setLevelState(3)
          .then((levelState) => {
            if (levelState.data.max >= 4) {
              this.manualTriggerTimer = setTimeout(() => {
                this._setLevelState(4)
                this.manualTriggerTimer = setTimeout(() => {
                  this._setLevelState(2).then(() => resolve(true))
                }, 4000)
              }, 4000)
            } else {
              this.manualTriggerTimer = setTimeout(() => {
                this._setLevelState(2).then(() => resolve(true))
              }, 4000)
            }
          })
      })
        .then(nextStep)
    }

    return super.trigger(executionId, triggerChain)
  }

  abort (executionId, nextStep = (result) => result) {
    const abortChain = (result) => {
      if (!result) {
        return result
      }
      return this._setLevelState(2)
        .then(() => {
          if (this.manualTriggerTimer) {
            clearTimeout(this.manualTriggerTimer)
          }
          return true
        })
        .then(nextStep)
    }

    return super.abort(executionId, abortChain)
  }

  afterUpdate () {
    // async way, no need to wait blocker function to be ready
    ServerSurveyScenario.scenariiService.getStateInstance(this.data.levelStateId)
      .then((levelState) => {
        if (!levelState) {
          ServerSurveyScenario.logger.warning('Level state update action failed: not found.')
          return Promise.reject(new Error('Level state update action failed: not found.'))
        }

        // TODO !0: during asterism boot, may sync FROM survey activation state TO levelState level ?
        ServerSurveyScenario.logger.warning('##### afterUpdate called.')
        ServerSurveyScenario.logger.warning('##### levelState.' + levelState.state)
        ServerSurveyScenario.logger.warning('##### this.level.' + this.level)

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

        // remove listeners on triggers if any
        this.data.raisingTriggers.forEach(({ triggerId }) => {
          const listened = this.raisingTriggersListened[triggerId]
          if (listened && listened.trigger && listened.listenerId) {
            listened.trigger.removeListener(listened.listenerId)
          }
        })
        this.data.deactivationTriggerIds.forEach((triggerId) => {
          const listened = this.deactivationTriggersListened[triggerId]
          if (listened && listened.trigger && listened.listenerId) {
            listened.trigger.removeListener(listened.listenerId)
          }
        })

        if (!this.activated) {
          // no trigger listener registration if inactive
          this.data.raisingTriggers.forEach(({ triggerId }) => {
            const listened = this.raisingTriggersListened[triggerId]
            if (listened && listened.trigger) {
              listened.trigger.reschedule()
            }
          })
          this.data.deactivationTriggerIds.forEach((triggerId) => {
            const listened = this.deactivationTriggersListened[triggerId]
            if (listened && listened.trigger) {
              listened.trigger.reschedule()
            }
          })

          return Promise.resolve(true)
        }

        this.data.raisingTriggers.forEach(({ name, triggerId, warningDelay }) => {
          ServerSurveyScenario.scenariiService.getTriggerInstance(triggerId)
            .then((trigger) => {
              this.raisingTriggersListened[triggerId] = {
                trigger,
                listenerId: trigger.addListener(() => {
                  ServerSurveyScenario.logger.info(`Scenario ${this.data.name}: Raising trigger has just been triggered (${name}).`)
                  this._setLevelState(3)
                  ServerSurveyScenario.scenariiService.privateSocket.emit(
                    'surveyLevelChanged',
                    { instanceId: this.instanceId, level: 3, triggerId, triggerName: name, delay: warningDelay }
                  )

                  if (levelState.data.max >= 4) {
                    if (!this.raisingTriggerTimers[triggerId]) {
                      this.raisingTriggerTimers[triggerId] = setTimeout(() => {
                        this._setLevelState(4)
                        ServerSurveyScenario.scenariiService.privateSocket.emit(
                          'surveyLevelChanged',
                          { instanceId: this.instanceId, level: 4, triggerId, triggerName: name }
                        )
                        this.raisingTriggerTimers[triggerId] = null
                      }, warningDelay * 1000)
                    } // else a warning delay is already counting, do not reset it here!
                  }
                })
              }
              trigger.reschedule()
            })
        })
        this.data.deactivationTriggerIds.forEach((triggerId) => {
          ServerSurveyScenario.scenariiService.getTriggerInstance(triggerId)
            .then((trigger) => {
              this.deactivationTriggersListened[triggerId] = {
                trigger,
                listenerId: trigger.addListener(() => {
                  ServerSurveyScenario.logger.info(`Scenario ${this.data.name}: Deactivation trigger has just been triggered (${triggerId}).`)
                  this._setLevelState(2)
                })
              }
              trigger.reschedule()
            })
        })
      })

    return Promise.resolve(true)
  }
}
