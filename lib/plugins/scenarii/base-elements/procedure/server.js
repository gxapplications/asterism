'use strict'

import uuid from 'uuid'
import { Scenarii } from 'asterism-plugin-library'
const { ServerAction } = Scenarii

export default class ServerProcedure extends ServerAction {
  get name () {
    return this.data.name || 'Unnamed procedure'
  }

  execute (executionId) {
    this.runningActions = this.runningActions || {}
    this.runningActions[executionId] = {}

    let run = Promise.resolve(true)
    this.executionIds[executionId] = run
    run = run.then(() => this.executeScript(this.data.script, executionId))

    return run
    .then((result) => {
      delete this.executionIds[executionId]
      return result
    })
    .catch((error) => {
      delete this.executionIds[executionId]
      throw error
    })
  }

  executeSequence (scriptsOrActions, executionId) {
    if (!this.executionIds[executionId]) {
      return Promise.resolve(false) // abort case
    }

    return scriptsOrActions.reduce((accumulator, scriptOrAction) => {
      return accumulator.then((previousResult) => {
        if (!previousResult) {
          console.info(`Previous action failure / abort. Stops procedure sequence.`)
          return Promise.resolve(false) // Failure case: previous action stopped (aborted or errored)
        }

        if (!this.executionIds[executionId]) {
          return Promise.resolve(false) // abort case
        }

        return (typeof scriptOrAction === 'string') ? this.executeAction(scriptOrAction, executionId) : this.executeScript(scriptOrAction, executionId)
      })
    }, Promise.resolve(true))
  }

  executeScript (script, executionId) {
    if (!this.executionIds[executionId]) {
      return Promise.resolve(false) // abort case
    }

    const sequences = Object.entries(script).map(([k, v]) => v)
    return Promise.all(sequences.map((sequence) => this.executeSequence(sequence, executionId)))
    .then((results) => results.reduce((acc, res) => acc & res, true)) // at least one false must give false
  }

  executeAction (actionId, procedureExecutionId) {
    return ServerProcedure.scenariiService.getActionInstance(actionId)
    .then((action) => {
      if (!action) {
        return Promise.reject(new Error(`Action not found (#${actionId}).`))
      }

      const executionId = uuid.v4()
      this.runningActions[procedureExecutionId][executionId] = action

      return action.execute(executionId)
      .then((result) => {
        delete this.runningActions[procedureExecutionId][executionId]
        return result
      })
      .catch((error) => {
        delete this.runningActions[procedureExecutionId][executionId]
        throw error
      })
    })
    .catch((error) => {
      return Promise.reject(new Error(`Action not found (#${actionId}) or execution failed.`, error))
    })
  }

  abort (executionId) {
    if (!this.executionIds[executionId]) {
      return Promise.reject(new Error('Action execution already stopped.'))
    }

    this.executionIds[executionId] = null // will abort on next step

    Object.entries(this.runningActions[executionId]).forEach(([id, action]) => {
      action.abort(id)
      delete this.runningActions[executionId][id]
    }) // will try to abort running sub actions (if supported)

    return Promise.resolve(true)
  }
}
