'use strict'

import { Scenarii } from 'asterism-plugin-library'
const { ServerTrigger } = Scenarii

export default class ServerBitmaskStateTrigger extends ServerTrigger {
  constructor (data) {
    super(data)
    this.schedule = null
    this.state = null
  }

  get name () {
    return this.data.name ? `State ${this.data.name}` : 'Misconfigured bitmask state trigger'
  }

  reschedule () {
    this.cancelEvents()
    if (this.listeners.filter((l) => !l.lazy).length === 0) {
      ServerBitmaskStateTrigger.logger.info(`Trigger ${this.data.name} has no active listener. Trigger unscheduled.`)
      // there is no mandatory listeners (lazy are called only if there is 'no lazy listeners' registered). So do no schedule.
      return Promise.resolve(true)
    }
    return this.scheduleEvents()
  }

  cancelEvents () {
    if (this.schedule && this.state) {
      this.state.removeListener(this.schedule)
      delete this.schedule
      delete this.state
    }
  }

  scheduleEvents () {
    try {
      return ServerBitmaskStateTrigger.scenariiService.getStateInstance(this.data.bitmaskStateId)
        .then((state) => {
          this.state = state
          this.schedule = state.addListener((newState, bitmaskState, oldState) => {
            if (newState === oldState) {
              return
            }

            const position = this.data.position
            const shift = 2 ** (position - 1)

            let mustTrigger = false
            const newPosition = (newState & shift) === shift
            const oldPosition = (oldState & shift) === shift

            switch (this.data.operator) {
              case 'position-set':
                mustTrigger = !oldPosition && newPosition
                break
              case 'position-unset':
                mustTrigger = oldPosition && !newPosition
                break
              case 'position-move':
                mustTrigger = oldPosition === !newPosition
                break
              case 'any-set':
                mustTrigger = (newState & ~oldState) > 0
                break
              case 'any-unset':
                mustTrigger = (oldState & ~newState) > 0
                break
              case 'any-move':
                mustTrigger = newState !== oldState
            }

            if (mustTrigger) {
              this.listeners.forEach((listener) => listener())
              this.reschedule()
            }
          })
          return true
        })
    } catch (error) {
      return Promise.reject(error)
    }
  }
}
