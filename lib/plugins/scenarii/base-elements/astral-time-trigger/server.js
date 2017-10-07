'use strict'

import moment from 'moment'
import 'moment-timer'
import SunCalc from 'suncalc'

import { Scenarii } from 'asterism-plugin-library'
const { ServerTrigger } = Scenarii

const _getWaitDuration = (data, lat = 0, lon = 0, now = moment()) => {
  now.millisecond(0)
  const immediately = now.clone() // considers this is NOW. Cannot schedule a task before that.
  immediately.add(1, 'seconds')
  let m = immediately.clone()

  let m2 = moment(SunCalc.getTimes(m.toDate(), lat, lon)[data.event || 'sunrise'])

  while (m2.isBefore(immediately) || !m2.isValid()) {
    m = m.add(1, 'days')
    m2 = moment(SunCalc.getTimes(m.toDate(), lat, lon)[data.event || 'sunrise'])
  }

  m2.millisecond(0)
  m2.add(data.timeshift || 0, 'minutes')

  const lowLimit = m2.clone().hour(0).second(0).minute(data.limitedWindowLow || 0)
  const highLimit = m2.clone().hour(0).second(0).minute(data.limitedWindowHigh || 1440)
  if (m2.isBefore(lowLimit)) {
    m2 = lowLimit
  }
  if (m2.isAfter(highLimit)) {
    m2 = highLimit
  }

  return moment.duration(m2.diff(now)) // gets duration between now and the target instant
}

export { _getWaitDuration }

export default class ServerAstralTimeTrigger extends ServerTrigger {
  constructor (data) {
    super(data)
    this.schedule = null
  }

  get name () {
    return this.data.name ? `Time reached ${this.data.name}` : `Misconfigured astral time trigger`
  }

  reschedule () {
    this.cancelEvents()
    if (this.listeners.filter((l) => !l.lazy).length === 0) {
      ServerAstralTimeTrigger.logger.info(`Trigger ${this.data.name} has no active listener. Trigger unscheduled.`)
      // there is no mandatory listeners (lazy are called only if there is 'no lazy listeners' registered). So do no schedule.
      return Promise.resolve(true)
    }
    return this.scheduleEvents()
  }

  cancelEvents () {
    if (this.schedule) {
      this.schedule.stop()
      delete this.schedule
    }
  }

  scheduleEvents () {
    return ServerAstralTimeTrigger.dataHandler.getItem('settings-domotics-location')
    .then((location) => {
      if (!location || !location.latitude || !location.longitude) {
        throw new Error('Please set a location first is Settings panel / Domotics section.')
      }

      const duration = _getWaitDuration(this.data, location.latitude, location.longitude)
      if (duration) {
        duration.timer({ start: true }, () => {
          this.listeners.forEach((listener) => listener())
          this.reschedule()
        })
        return true
      }

      return false
    })
  }
}
