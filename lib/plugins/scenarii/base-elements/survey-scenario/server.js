'use strict'

import { Scenarii } from 'asterism-plugin-library'
const { ServerScenario } = Scenarii

/*
Error: The trigger #3767a612-195a-4420-bbd8-795949a0bf5c is unknown.
0|asterism |     at ScenariiService.getTriggerInstance (/home/pi/asterism-for-domotics/node_modules/asterism/dist/plugins/scenarii/server/service.js:1:24589)
0|asterism |     at /home/pi/asterism-for-domotics/node_modules/asterism/dist/plugins/scenarii/base-elements/survey-scenario/server.js:1:14585
0|asterism |     at Array.forEach (<anonymous>)
0|asterism |     at /home/pi/asterism-for-domotics/node_modules/asterism/dist/plugins/scenarii/base-elements/survey-scenario/server.js:1:14446
0|asterism | Error: The trigger #cc2ffe60-b833-4196-a995-44d68aea20d8 is unknown.
0|asterism |     at ScenariiService.getTriggerInstance (/home/pi/asterism-for-domotics/node_modules/asterism/dist/plugins/scenarii/server/service.js:1:24589)
0|asterism |     at /home/pi/asterism-for-domotics/node_modules/asterism/dist/plugins/scenarii/base-elements/survey-scenario/server.js:1:14585
0|asterism |     at Array.forEach (<anonymous>)
0|asterism |     at /home/pi/asterism-for-domotics/node_modules/asterism/dist/plugins/scenarii/base-elements/survey-scenario/server.js:1:14446
 */
export default class ServerSurveyScenario extends ServerScenario {
  constructor (data) {
    super(data)
    this.notificationHandler = ServerSurveyScenario.scenariiService.notificationHandler

    this.arming = false
    this.armingTimer = null
    this.level = 1
    this._forceLevelStateListenerId = null
    this.manualTriggerTimer = null
    this.armingActionExecutions = []
    this.warningActionExecutions = []
    this.alarmingActionExecutions = []

    this.raisingTriggersListened = {}
    this.raisingTriggerTimers = {}
    this.deactivationTriggersListened = {}
  }

  get name () {
    return this.data.name ? `Survey ${this.data.name}` : 'Misconfigured survey scenario'
  }

  _setLevelState (level, triggerId = null, triggerName = null, delay = null) {
    return ServerSurveyScenario.scenariiService.getStateInstance(this.data.levelStateId)
      .then((levelState) => {
        if (!levelState) {
          ServerSurveyScenario.logger.warning('Level state update action failed: not found.')
          throw new Error('Level state update action failed: not found.')
        }

        const emitMetaData = { instanceId: this.instanceId, level, triggerId, triggerName, delay }

        const oldLevel = this.level
        this.level = level // must update this.level before levelState.state, to avoid prevalidator to fail.
        levelState.state = level

        if (level === 1) {
          // Cancel executing arming actions if still any
          this.armingActionExecutions.filter(e => e && e.length).forEach(([executionId, action]) => {
            ServerSurveyScenario.scenariiService.abortActionData(action, executionId)
          })
          this.armingActionExecutions = []
        }

        // from old level > 2 to new level <=2
        if (level <= 2 && oldLevel > 2) {
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

          // TODO !0: notification: alarm ended, to test
          this.notificationHandler.pushNotificationMessage(
            'Asterism Survey alarm',
            `Survey alarm '${this.data.name}' ended.`,
            'info',
            { tag: this.data.levelStateId, renotify: false }
          )

          ServerSurveyScenario.scenariiService.privateSocket.emit('surveyLevelChanged', emitMetaData)
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

          // TODO !0: notification: alarm in warning mode, to test
          this.notificationHandler.pushNotificationMessage(
            'Asterism Survey alarm',
            `Survey alarm '${this.data.name}' is warning!`,
            'warning',
            { tag: this.data.levelStateId, renotify: true }
          )

          ServerSurveyScenario.scenariiService.privateSocket.emit('surveyLevelChanged', emitMetaData)
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

          // TODO !0: notification: alarm raised mode, to test
          this.notificationHandler.pushNotificationMessage(
            'Asterism Survey alarm',
            `Survey alarm '${this.data.name}' raised!`,
            'error',
            { tag: this.data.levelStateId, renotify: true }
          )

          ServerSurveyScenario.scenariiService.privateSocket.emit('surveyLevelChanged', emitMetaData)
          return levelState
        }

        ServerSurveyScenario.scenariiService.privateSocket.emit('surveyLevelChanged', emitMetaData)
        return levelState
      })
  }

  requestSoftActivation (value, immediately = false) {
    if (this.armingTimer) {
      clearTimeout(this.armingTimer)
    }

    if (!value) { // deactivation
      this.arming = false
      if (this.activated) {
        this.activated = false
        return this._setLevelState(1).then(() => true)
      }
      return Promise.resolve(true)
    }

    if (immediately === true) { // instant activation
      this.arming = false
      if (!this.activated) {
        this.activated = true
        return this._setLevelState(2).then(() => true)
      }
      return Promise.resolve(true)
    }

    // delayed activation
    this._setLevelState(1) // async, do not wait for it, not needed
    this.arming = true

    // TODO !1: must check armingConditionsToNotice: if one of them is true,
    //  then must suspend arming process and wait for user confirmation ?

    // Execution of arming actions, async way
    this.data.armingActions.map((armingActionId, idx) => {
      const executionIdPrefix = `survey-${this.data.levelStateId}-arming-actions-`
      ServerSurveyScenario.scenariiService.getActionInstance(armingActionId)
        .then((action) => {
          if (!action) {
            ServerSurveyScenario.logger.warn(`Scenario ${this.data.name}: Action not found!`)
            return
          }
          this.armingActionExecutions[idx] = [executionIdPrefix + idx, action]
          ServerSurveyScenario.scenariiService.executeActionData(action, this.armingActionExecutions[idx][0])
            .finally(() => {
              this.armingActionExecutions[idx] = null
            })
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
          ServerSurveyScenario.logger.warn('Level state update action failed: not found.')
          return Promise.reject(new Error('Level state update action failed: not found.'))
        }

        // TODO !1: during asterism boot, may sync FROM survey activation state TO levelState level ?
        ServerSurveyScenario.logger.warn('##### afterUpdate called.')
        if (this.level !== levelState.state) {
          ServerSurveyScenario.logger.warn('##### levelState.' + levelState.state)
          ServerSurveyScenario.logger.warn('##### this.level.' + this.level)
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
          ServerSurveyScenario.scenariiService.getTriggerInstance(triggerId, true)
            .then((trigger) => {
              this.raisingTriggersListened[triggerId] = {
                trigger,
                listenerId: trigger.addListener(() => {
                  ServerSurveyScenario.logger.info(`Scenario ${this.data.name}: Raising trigger has just been triggered (${name}).`)
                  this._setLevelState(3, triggerId, name, warningDelay)

                  if (levelState.data.max >= 4) {
                    if (!this.raisingTriggerTimers[triggerId]) {
                      this.raisingTriggerTimers[triggerId] = setTimeout(() => {
                        this._setLevelState(4, triggerId, name)
                        this.raisingTriggerTimers[triggerId] = null
                      }, warningDelay * 1000)
                    } // else a warning delay is already counting, do not reset it here!
                  }
                })
              }
              trigger.reschedule()
            })
            .catch((error) => {
              ServerSurveyScenario.logger.warn(`Scenario ${this.data.name}: Raising trigger ${name} #${triggerId} not found.`)
            })
        })
        this.data.deactivationTriggerIds.forEach((triggerId) => {
          ServerSurveyScenario.scenariiService.getTriggerInstance(triggerId, true)
            .then((trigger) => {
              this.deactivationTriggersListened[triggerId] = {
                trigger,
                listenerId: trigger.addListener(() => {
                  ServerSurveyScenario.logger.info(`Scenario ${this.data.name}: Deactivation trigger has just been triggered (${triggerId}).`)
                  this._setLevelState(2, triggerId)
                })
              }
              trigger.reschedule()
            })
        })
      })

    return Promise.resolve(true)
  }
}
