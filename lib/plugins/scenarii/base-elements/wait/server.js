'use strict'

import moment from 'moment'
import 'moment-timer'

import { Scenarii } from 'asterism-plugin-library'
const { ServerAction } = Scenarii

const _getWaitDuration = (data, now = moment()) => {
  now.millisecond(0)
  const immediately = now.clone()
  immediately.add(1, 'seconds')
  const m = immediately.clone()

  switch (data.waitMode) {
    case 'amount':
    default:
      return moment.duration(data.amount, data.amountUnit)
    case 'until':
      const tomorrow = data.untilOccurrence === 'tomorrow'
      const [hour, minute] = data.until.split(':')
      m.hour(hour)
      m.minute(minute)
      m.second(0)
      if (tomorrow || m.isBefore(immediately)) {
        m.add(1, 'days')
      }
      break
    case 'untilQuarter':
      m.minute(0)
      m.second(0)
      switch (data.untilQuarter) {
        case '00/15/30/45':
        default:
          while (m.isBefore(immediately)) {
            m.add(15, 'minutes')
          }
          break
        case '00/30':
          while (m.isBefore(immediately)) {
            m.add(30, 'minutes')
          }
          break
        case '00':
        case '15':
        case '30':
        case '45':
          m.minute(data.untilQuarter)
          while (m.isBefore(immediately)) {
            m.add(1, 'hours')
          }
          break
      }
      break
  }

  return moment.duration(m.diff(now)) // gets duration between now and the target instant
}

export { _getWaitDuration }

export default class ServerWait extends ServerAction {
  get name () {
    return this.data.name ? `Wait ${this.data.name}` : `Misconfigured wait timer`
  }

  execute (executionId) {
    this.runningActions = this.runningActions || {}
    this.runningActions[executionId] = {}

    const run = new Promise((resolve, reject) => {
      try {
        const duration = _getWaitDuration(this.data)
        /* console.log(`Now its [${moment().format('dddd, MMMM Do YYYY, h:mm:ss:SSS a Z')}].
          Target is at [${moment().add(duration, 'milliseconds').format('dddd, MMMM Do YYYY, h:mm:ss:SSS a Z')}]`) */

        duration.timer({ start: true }, () => {
          if (!this.executionIds[executionId]) {
            return resolve(false) // abort case
          }
          console.log(`Wait action reached target time.`)
          resolve(true)
        })
      } catch (error) {
        reject(error)
      }
    })

    this.executionIds[executionId] = run

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

  abort (executionId) {
    if (!this.executionIds[executionId]) {
      return Promise.reject(new Error('Action execution already stopped.'))
    }

    this.executionIds[executionId] = null // will abort on next step
    return Promise.resolve(false)
  }
}
