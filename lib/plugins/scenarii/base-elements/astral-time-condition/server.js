'use strict'

import moment from 'moment'
import SunCalc from 'suncalc'

import { Scenarii } from 'asterism-plugin-library'

const { ServerCondition } = Scenarii

export default class ServerAstralTimeCondition extends ServerCondition {
  get name () {
    return this.data.name ? `Astral time limited ${this.data.name}` : `Misconfigured astral time condition`
  }

  test () {
    return ServerAstralTimeCondition.dataHandler.getItem('settings-domotics-location')
    .then((location) => {
      if (!location || !location.latitude || !location.longitude) {
        throw new Error('Please set a location first is Settings panel / Domotics section.')
      }

      const now = moment()
      const sunTimes = SunCalc.getTimes(new Date(), location.latitude, location.longitude)
      let start = null
      let end = null

      switch (this.data.event) {
        case 'daylight':
          start = moment(sunTimes['goldenHourEnd'])
          end = moment(sunTimes['goldenHour'])
          break
        case 'fewlight':
          start = moment(sunTimes['sunriseEnd'])
          end = moment(sunTimes['sunsetStart'])
          break
        case 'sunrise':
        case 'sunset':
        case 'solarNoon':
        case 'nadir':
          start = moment(sunTimes[this.data.event]).subtract(this.data.timeshift, 'minutes')
          end = moment(sunTimes[this.data.event]).add(this.data.timeshift, 'minutes')
          break
      }

      return now.isBefore(end) && now.isAfter(start)
    })
  }
}
