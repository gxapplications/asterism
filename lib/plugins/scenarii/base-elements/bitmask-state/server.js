'use strict'

import { Scenarii } from 'asterism-plugin-library'
const { ServerState } = Scenarii

export default class ServerBitmaskState extends ServerState {
  constructor (data) {
    super(data)
    this.oldState = data.state || 1
  }

  get name () {
    return this.data.name || 'Unnamed bitmask state'
  }

  get color () {
    return this.data.colors[this.data.state - 1]
  }

  get state () {
    return this.data.state
  }

  set state (state) {
    if (state >= 2 ** this.data.count) {
      state = 2 ** this.data.count - 1
    } else {
      if (state < 0) {
        state = 0
      } else {
        state = parseInt(state) || 0
      }
    }

    // if listeners have preValidate and one of these returns false, then do not update state
    if (!this.preValidate(state, this.data.state)) {
      throw new Error('Pre validation failed. State cannot be set at this value')
    }

    this.data.state = state

    this.listeners.forEach((listener) => {
      try {
        listener(this.data.state, this, this.oldState)
      } catch (error) {
        console.error(error)
      }
    })
    this.oldState = this.data.state
  }
}
