'use strict'

import { Scenarii } from 'asterism-plugin-library'

const { ServerCondition } = Scenarii

export default class ServerLevelStateCondition extends ServerCondition {
  get name () {
    return this.data.name ? `State ${this.data.name}` : `Misconfigured level state condition`
  }

  test () {
    return ServerLevelStateCondition.scenariiService.getStateInstance(this.data.levelStateId)
    .then((state) => {
      if (!state) {
        throw new Error(`Level state condition test failed: Level state with ID ${this.data.levelStateId} not found.`)
      }

      switch (this.data.operator) {
        case 'eq':
          return state.state === this.data.level
        case 'lte':
          return state.state <= this.data.level
        case 'between':
          return (state.state >= this.data.level) && (state.state <= this.data.level2)
        case 'gte':
          return state.state >= this.data.level
      }

      return Promise.reject(new Error('Level state condition test failed: operator unknown.'))
    })
  }
}
