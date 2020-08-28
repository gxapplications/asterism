'use strict'

import { Scenarii } from 'asterism-plugin-library'
const { ServerAction } = Scenarii

export default class ServerBitmaskStateChanger extends ServerAction {
  get name () {
    return this.data.name ? `State update ${this.data.name}` : 'Misconfigured bitmask state update'
  }

  execute (executionId) {
    return ServerBitmaskStateChanger.scenariiService.getStateInstance(this.data.bitmaskStateId)
      .then((bitmaskState) => {
        if (!bitmaskState) {
          ServerBitmaskStateChanger.logger.warning(`Bitmask state update action failed: ${this.data.name} not found.`)
          return Promise.reject(new Error(`Bitmask state update action failed: ${this.data.name} not found.`))
        }

        const position = this.props.instance.data.position
        const shift = 2 ** (position - 1)
        const oldState = bitmaskState.state

        return new Promise((resolve, reject) => {
          switch (this.props.instance.data.operation) {
            case 'set-position':
            default:
              bitmaskState.state = oldState | shift
              break
            case 'unset-position':
              bitmaskState.state = oldState & ~shift
              break
            case 'invert-position':
              bitmaskState.state = oldState ^ shift // XOR will invert bit value
              break
            case 'unset-all':
              bitmaskState.state = 0 // all false
              break
            case 'set-all':
              bitmaskState.state = 256 // all true (maybe overflow, but dynamis setter will fix this)
          }
          resolve(true)
        })
      })
  }
}
