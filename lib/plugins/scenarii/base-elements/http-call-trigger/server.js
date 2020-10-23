'use strict'

import { Scenarii } from 'asterism-plugin-library'
const { ServerTrigger } = Scenarii

export default class ServerHttpCallTrigger extends ServerTrigger {
  constructor (data) {
    super(data)
    this.schedule = null
  }

  get name () {
    return this.data.name ? `Insecure HTTP call ${this.data.name}` : 'Misconfigured insecure HTTP call trigger'
  }

  reschedule () {
    this.cancelEvents()
    if (this.listeners.filter((l) => !l.lazy).length === 0) {
      ServerHttpCallTrigger.logger.info(`Trigger ${this.data.name} has no active listener. Trigger unscheduled.`)
      // there is no mandatory listeners (lazy are called only if there is 'no lazy listeners' registered). So do not schedule.
      return Promise.resolve(true)
    }
    return this.scheduleEvents()
  }

  cancelEvents () {
    if (this.schedule) {
      ServerHttpCallTrigger.scenariiService.removeHttpListener(this.schedule)
      delete this.schedule
    }
  }

  scheduleEvents () {
    try {
      this.schedule = ServerHttpCallTrigger.scenariiService.addHttpListener((req) => {
        if (this.data.method !== req.method) {
          return Promise.resolve(false)
        }
        const regexp = new RegExp(`^${this.data.path}$`, 'g')
        if (!regexp.test(req.params['0'])) {
          return Promise.resolve(false)
        }

        return Promise.allSettled(this.listeners.map((listener) => listener()))
          .then((results) => {
            const failed = results.some((result) => result.status === 'rejected')
            this.reschedule()
            if (failed) {
              throw new Error(this.data.error)
            }
            return this.data.success
          })
      })
      return Promise.resolve(true)
    } catch (error) {
      return Promise.reject(error)
    }
  }
}
