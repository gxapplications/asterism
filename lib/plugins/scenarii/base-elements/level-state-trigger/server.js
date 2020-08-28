'use strict'

import { Scenarii } from 'asterism-plugin-library'
const { ServerTrigger } = Scenarii

export default class ServerLevelStateTrigger extends ServerTrigger {
  constructor (data) {
    super(data)
    this.schedule = null
    this.state = null
  }

  get name () {
    return this.data.name ? `State ${this.data.name}` : 'Misconfigured level state trigger'
  }

  reschedule () {
    this.cancelEvents()
    if (this.listeners.filter((l) => !l.lazy).length === 0) {
      ServerLevelStateTrigger.logger.info(`Trigger ${this.data.name} has no active listener. Trigger unscheduled.`)
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
      return ServerLevelStateTrigger.scenariiService.getStateInstance(this.data.levelStateId)
        .then((state) => {
          this.state = state
          this.schedule = state.addListener((level, levelState, oldLevel) => {
            if (level === oldLevel) {
              return
            }

            const goodValue = ((this.data.way === 'left') && (this.data.level !== level)) || (this.data.level === level)

            const goodWay = (this.data.way === 'reach') ||
            ((oldLevel < level) && (this.data.way === 'upward')) ||
            ((oldLevel > level) && (this.data.way === 'downward'))

            if (goodValue && goodWay) {
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
