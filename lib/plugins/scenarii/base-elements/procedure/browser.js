'use strict'

import { Scenarii } from 'asterism-plugin-library'

import BrowserProcedureEditForm from './edit-form'

const { BrowserAction } = Scenarii

class BrowserProcedure extends BrowserAction {
  get name () {
    return this.data.name || 'Unnamed procedure'
  }
  get shortLabel () {
    return `Procedure '${this.data.name || '(Unnamed)'}'`
  }
  get fullLabel () {
    const actionIds = [this.data.script].reduce(this.actionsReducer.bind(this), [])
    const rootSequencesCount = Object.entries(this.data.script).length
    const sequences = rootSequencesCount === 1 ? 'a unique sequence' : `${rootSequencesCount} parallel sequences`
    return `Program with ${actionIds.length} actions in ${sequences}.`
  }

  get EditForm () {
    return BrowserProcedureEditForm
  }

  actionsReducer (actions, scriptOrAction) {
    if (typeof scriptOrAction === 'string') {
      if (!actions.includes(scriptOrAction)) {
        actions.push(scriptOrAction)
      }
      return actions
    } else {
      return Object.entries(scriptOrAction)
        .map(([sequenceKey, sequence]) => sequence)
        .reduce((a, b) => a.concat(b)) // flatten 1 level
        .reduce(this.actionsReducer.bind(this), actions)
    }
  }

  presave (services) {
    const scenariiService = services()['asterism-scenarii']
    const actionIdsToKeep = [this.data.script].reduce(this.actionsReducer.bind(this), [])

    return scenariiService.getActionInstances(this.instanceId)
    .then((procedureActions) => {
      const actionsToRemove = procedureActions.filter((a) => !actionIdsToKeep.includes(a.instanceId))

      return Promise.all([
        ...actionsToRemove.map(scenariiService.deleteActionInstance.bind(scenariiService)),
        ...actionIdsToKeep.map((id) => {
          const actionToKeep = this.editedActions[id]
          if (!actionToKeep) {
            // not edited, so no need to save it
            return Promise.resolve()
          }
          return scenariiService.setActionInstance(actionToKeep, actionToKeep.parent)
        })
      ])
    })
  }
}

BrowserProcedure.type = Object.assign({}, BrowserAction.type, {
  name: 'Procedure',
  shortLabel: 'Basic procedure',
  fullLabel: 'A scripted list of actions, played in sequence or simultaneously'
})

export default BrowserProcedure
