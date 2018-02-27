'use strict'

import { Scenarii } from 'asterism-plugin-library'
const { ServerAction } = Scenarii

export default class ServerLevelStateChanger extends ServerAction {
  get name () {
    return this.data.name ? `Level state ${this.data.name}` : `Misconfigured level state update`
  }

  execute (executionId) {
    return ServerLevelStateChanger.scenariiService.getStateInstance(this.data.levelStateId)
    .then((levelState) => {
      if (!levelState) {
        ServerLevelStateChanger.logger.warning(`Level state update action failed: ${this.data.name} not found.`)
        return Promise.reject(new Error(`Level state update action failed: ${this.data.name} not found.`))
      }

      return new Promise((resolve, reject) => {
        switch (this.data.operation) {
          // levelState.state setter is protected for extra boundaries
          case 'increment':
            levelState.state = levelState.state + this.data.amount
            break
          case 'decrement':
            levelState.state = levelState.state - this.data.amount
            break
          case 'replace':
          default:
            levelState.state = this.data.amount
        }
        resolve(true)
      })
    })
  }
}
