'use strict'

import { Scenarii } from 'asterism-plugin-library'
const { ServerCondition } = Scenarii

const _getDayOccurrencesInMonth = (now) => {
  const day = now.getDay()
  const date = now.getDate()
  const o = []

  if (date <= 7) {
    return [[1, day]]
  }
  if (date <= 14) {
    return [[2, day]]
  }
  if (date <= 21) {
    o.push([3, day])
  }
  if (date > 21 && date <= 28) {
    o.push([4, day])
  }

  const leapYear = [2016, 2020, 2024, 2028, 2032, 2036, 2040, 2044, 2048, 2052, 2056, 2060].includes(now.getFullYear())
  const maxDate = [31, leapYear ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][now.getMonth()]
  if (date > maxDate - 7) {
    o.push([9, day])
    return o
  }
  if (date > maxDate - 14) {
    o.push([8, day])
    return o
  }
  return o
}

export { _getDayOccurrencesInMonth }

export default class ServerTimeBasedCondition extends ServerCondition {
  get name () {
    return this.data.name ? `Time limited ${this.data.name}` : 'Misconfigured time based condition'
  }

  test () {
    const now = new Date()

    switch (this.data.dayMode) {
      case 'weekdays':
        if (!this.data.weekdays.includes(now.getDay())) {
          return Promise.resolve(false)
        }
        break
      case 'dayInMonth':
        if (!this.data.dayInMonth.includes(now.getDate())) {
          return Promise.resolve(false)
        }
        break
      case 'dayAndMonth': {
        const dm = ((now.getMonth() + 1) << 5) + (now.getDate() - 1)
        if (!this.data.dayAndMonth.includes(dm)) {
          return Promise.resolve(false)
        }
        break
      }
      case 'weekdayInMonth': {
        const ods = _getDayOccurrencesInMonth(now)
        const deepInclude = o => e => (e[0] === o[0] && e[1] === o[1])
        if (!this.data.weekdayInMonth.find(deepInclude(ods[0])) &&
          (ods.length === 1 || !this.data.weekdayInMonth.find(deepInclude(ods[1])))
        ) {
          return Promise.resolve(false)
        }
        break
      }
      case 'whatever':
      default:
        break
    }

    const nowMinutes = (now.getHours() * 60) + now.getMinutes()
    let beforeAfterMinutes = this.data.timeBeforeAfter.split(':')
    beforeAfterMinutes = (parseInt(beforeAfterMinutes[0]) * 60) + parseInt(beforeAfterMinutes[1])
    switch (this.data.timeMode) {
      case 'between': {
        const isOutOfLap = ([start, end]) => (nowMinutes < start || nowMinutes >= end)
        if (this.data.timeBetweens.every(isOutOfLap)) {
          return Promise.resolve(false)
        }
        break
      }
      case 'before':
        if (nowMinutes >= beforeAfterMinutes) {
          return Promise.resolve(false)
        }
        break
      case 'after':
        if (nowMinutes < beforeAfterMinutes) {
          return Promise.resolve(false)
        }
        break
      case 'whatever':
      default:
        break
    }

    return Promise.resolve(true)
  }
}
