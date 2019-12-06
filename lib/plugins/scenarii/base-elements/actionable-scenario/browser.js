'use strict'

import { Scenarii } from 'asterism-plugin-library'

import BrowserActionableScenarioEditForm from './edit-form'

const { BrowserScenario } = Scenarii

class BrowserActionableScenario extends BrowserScenario {
  get name () {
    return this.data.name ? `Scenario ${this.data.name}` : `Misconfigured actionable scenario`
  }
  get shortLabel () {
    return this.data.name ? `Actionable scenario (${this.data.name})` : this.name
  }
  get fullLabel () {
    return this.data.name ? `Conditionally triggers an action (${this.data.name}).` : this.name
  }

  get EditForm () {
    return BrowserActionableScenarioEditForm
  }

  getAutoName (trigger, condition, action) {
    try {
      if (condition) {
        return `When '${trigger.name}' and if '${condition.name}' then '${action.name}'`
      }
      return `When '${trigger.name}' then '${action.name}'`
    } catch (error) {
      return `Misconfigured actionable scenario`
    }
  }

  presave (services) {
    if (!this.data.name || this.data.name === '') {
      const scenariiService = services()['asterism-scenarii']

      return Promise.all([
        scenariiService.getTriggerInstance(this.data.executionTrigger, true),
        scenariiService.getConditionInstance(this.data.executionCondition, true),
        scenariiService.getActionInstance(this.data.action, true)
      ])
      .then(([trigger, condition, action]) => {
        this.data.name = this.getAutoName(trigger, condition, action)
      })
    }
    return Promise.resolve()
  }
}

BrowserActionableScenario.type = Object.assign({}, BrowserScenario.type, {
  name: 'Actionable scenario',
  shortLabel: 'Actionable scenario',
  fullLabel: 'Action conditionally triggered in a scenario when an event occurs.',
  icon: 'help_outline'
})

export default BrowserActionableScenario
