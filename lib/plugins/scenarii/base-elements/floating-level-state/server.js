'use strict'

import { Scenarii } from 'asterism-plugin-library'
const { ServerState } = Scenarii

export default class ServerFloatingLevelState extends ServerState {
  constructor (data) {
    super(data)
    this.oldState = data.state || 0.0
  }

  get name () {
    return this.data.name || 'Unnamed floating level state'
  }

  get state () {
    return this.data.state
  }

  set state (state) {
    if (state > this.data.max) {
      state = this.data.max
    } else {
      if (state < this.data.min) {
        state = this.data.min
      } else {
        state = parseFloat(state) || 0.0
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
