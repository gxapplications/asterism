'use strict'

import { Scenarii } from 'asterism-plugin-library'

const { ServerCondition } = Scenarii

export default class ServerBitmaskStateCondition extends ServerCondition {
  get name () {
    return this.data.name ? `State ${this.data.name}` : 'Misconfigured bitmask state condition'
  }

  test () {
    return ServerBitmaskStateCondition.scenariiService.getStateInstance(this.data.bitmaskStateId)
      .then((state) => {
        if (!state) {
          throw new Error(`Bitmask state condition test failed: Bitmask state with ID ${this.data.bitmaskStateId} not found.`)
        }

        const max = (2 ** state.data.count) - 1
        const position = this.data.position
        const shift = 2 ** (position - 1)

        switch (this.data.operator) {
          case 'position-set':
            return Promise.resolve((state.state & shift) === shift)
          case 'position-unset':
            return Promise.resolve((state.state & shift) === 0)
          case 'position-only-set':
            return Promise.resolve(state.state === shift)
          case 'position-only-unset':
            return Promise.resolve(state.state === ~shift)
          case 'all-unset':
            return Promise.resolve(state.state === 0)
          case 'all-set':
            return Promise.resolve(state.state === max)
          case 'only-one-set':
            return Promise.resolve(state.state.toString(2).replace(/0/g, '') === '1')
          case 'only-one-unset':
            return Promise.resolve(state.state.toString(2).replace(/0/g, '').length === state.data.count - 1)
          case 'have-both':
            return Promise.resolve((state.state > 0) && (state.state < max))
        }

        return Promise.reject(new Error('Bitmask state condition test failed: operator unknown.'))
      })
  }
}
