'use strict'

import uuid from 'uuid'

import { Scenarii } from 'asterism-plugin-library'
const { ServerScenario } = Scenarii

export default class ServerActionableScenario extends ServerScenario {
  constructor (data) {
    super(data)
    this.executionTriggerListened = null
    this.executionTriggerListenerId = null
    this.abortTriggerListened = null
    this.abortTriggerListenerId = null
  }

  get name () {
    return this.data.name ? `Scenario ${this.data.name}` : 'Misconfigured actionable scenario'
  }

  trigger (executionId, nextStep = (result) => result) {
    const triggerChain = (result) => {
      if (!result) {
        return result
      }

      return new Promise((resolve, reject) => {
        // Condition stage

        if (!this.data.executionCondition) {
          return resolve(true)
        }

        ServerActionableScenario.scenariiService.getConditionInstance(this.data.executionCondition)
          .then((condition) => {
            ServerActionableScenario.logger.info(`Scenario ${this.data.name}: Testing condition ${(condition.data && condition.data.name) || 'unnamed'}...`)
            return condition.test()
          })
          .then((result) => {
            ServerActionableScenario.logger.info(`Scenario ${this.data.name}: Condition returned ${result ? 'true' : 'false'}`)
            resolve(result)
          })
          .catch(() => {
            ServerActionableScenario.logger.warn(`Scenario ${this.data.name}: Condition not found! Proceeding anyway!`)
            resolve(true)
          })
      })
        .then((result) => {
        // Action stage

          if (!result) {
            return result
          }

          return ServerActionableScenario.scenariiService.getActionInstance(this.data.action)
            .then((action) => {
              if (!action) {
                ServerActionableScenario.logger.warn(`Scenario ${this.data.name}: Action not found!`)
                return false
              }
              return ServerActionableScenario.scenariiService.executeActionData(action, executionId)
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

      return ServerActionableScenario.scenariiService.abortActionData({ instanceId: this.data.action }, executionId)
        .then(nextStep)
    }

    return super.abort(executionId, abortChain)
  }

  afterUpdate () {
    if (this.executionTriggerListened && this.executionTriggerListenerId) {
      this.executionTriggerListened.removeListener(this.executionTriggerListenerId)
    }
    if (this.abortTriggerListened && this.abortTriggerListenerId) {
      this.abortTriggerListened.removeListener(this.abortTriggerListenerId)
    }

    if (!this.activated) {
      // no trigger listener registration if inactive
      if (this.executionTriggerListened) {
        this.executionTriggerListened.reschedule()
      }
      if (this.abortTriggerListened) {
        this.abortTriggerListened.reschedule()
      }
      return Promise.resolve(true)
    }

    return Promise.all([
      this.data.executionTrigger ? ServerActionableScenario.scenariiService.getTriggerInstance(this.data.executionTrigger, true)
        .then((executionTrigger) => {
          this.executionTriggerListenerId = executionTrigger.addListener(() => {
            ServerActionableScenario.logger.info(`Scenario ${this.data.name}: Execution trigger has just been triggered.`)
            this.trigger(uuid.v4())
          })
          this.executionTriggerListened = executionTrigger
          return this.executionTriggerListened.reschedule()
        }) : Promise.resolve(true),
      this.data.abortTrigger ? ServerActionableScenario.scenariiService.getTriggerInstance(this.data.abortTrigger, true)
        .then((abortTrigger) => {
          this.abortTriggerListenerId = abortTrigger.addListener(() => {
            ServerActionableScenario.logger.info(`Scenario ${this.data.name}: Abort trigger has just been triggered.`)
            this.abort() // abort all, no ID given
          })
          this.abortTriggerListened = abortTrigger
          return this.abortTriggerListened.reschedule()
        }) : Promise.resolve(true)
    ])
      .then(([res1, res2]) => res1 & res2)
      .catch((error) => {
        ServerActionableScenario.logger.warn(`Cannot activate '${this.name}' due to trigger error: ${error.message}`)
        return false
      })
  }
}
