'use strict'
/* eslint-disable no-labels */

import moment from 'moment'
import 'moment-timer'

import { Scenarii } from 'asterism-plugin-library'
const { ServerTrigger } = Scenarii

const _weekdayMapper = initDay => ([o, d]) => {
  const day = initDay.startOf('month')
  if (o <= 4) {
    while (day.day() !== d) {
      day.add(1, 'days')
    }
    day.add(o - 1, 'weeks')
  }
  if (o === 8) { // Penultimate case
    day.endOf('month').startOf('day')
    while (day.day() !== d) {
      day.subtract(1, 'days')
    }
    day.subtract(1, 'weeks')
  }
  if (o === 9) { // Last case
    day.endOf('month').startOf('day')
    while (day.day() !== d) {
      day.subtract(1, 'days')
    }
  }
  return day
}

const _getWaitDuration = (data, now = moment()) => {
  now.millisecond(0)
  const immediately = now.clone() // considers this is NOW. Cannot schedule a task before that.
  immediately.add(1, 'seconds')
  let m = immediately.clone()
  let nextDay = now.clone() // computes another day matching dayMode settings, in case timeMode set m in the past.
  nextDay.hour(0)
  nextDay.minute(0)
  nextDay.second(0)

  // set m to refers to the right FIRST corresponding day, and nextDay the day AFTER m, corresponding to a valid day too
  l1: switch (data.dayMode) {
    case 'everyday':
      break // nothing to do I guess :)

    case 'weekdays':
      if (data.weekdays.length === 0) {
        return null
      }
      while (!data.weekdays.includes(m.isoWeekday() % 7)) {
        m.add(1, 'days')
        nextDay.add(1, 'days')
      }
      do {
        nextDay.add(1, 'days')
      } while (!data.weekdays.includes(nextDay.isoWeekday() % 7))
      break

    case 'dayInMonth':
      const days = data.dayInMonth.sort((a, b) => a - b)
      let currentMonth = m.month() // we keep this and force back into m, to bubble down date in limit cases (31 feb => 28 feb, instead of 3 mar)

      m.date(days[0]).month(currentMonth)
      nextDay.date(days[0]).month(currentMonth)
      for (let day of days.slice(1)) {
        if (m.isBefore(immediately)) {
          m.date(day).month(currentMonth)
          nextDay.date(day).month(currentMonth)
        } else {
          nextDay.date(day).month(currentMonth)
          break l1
        }
      }

      if (m.isBefore(immediately)) {
        m.add(1, 'months')
        nextDay.add(1, 'months')
        currentMonth = m.month()

        m.date(days[0]).month(currentMonth)
        nextDay.date(days[0]).month(currentMonth)

        for (let day of days.slice(1)) {
          if (m.isBefore(immediately)) {
            m.date(day).month(currentMonth)
            nextDay.date(day).month(currentMonth)
          } else {
            nextDay.date(day).month(currentMonth)
            break l1
          }
        }
      }

      break

    case 'dayAndMonth':
      const dates = data.dayAndMonth.sort((a, b) => a - b).map((dm) => [(dm % 32) + 1, (dm >> 5) - 1])

      m.month(dates[0][1])
      m.date(dates[0][0])
      nextDay.month(dates[0][1])
      nextDay.date(dates[0][0])
      for (let [day, month] of dates.slice(1)) {
        if (m.isBefore(immediately)) {
          m.month(month)
          m.date(day)
          nextDay.month(month)
          nextDay.date(day)
        } else {
          nextDay.month(month)
          nextDay.date(day)
          break l1
        }
      }

      if (m.isBefore(immediately)) {
        m.month(dates[0][1])
        m.date(dates[0][0])
        nextDay.month(dates[0][1])
        nextDay.date(dates[0][0])
        m.add(1, 'years')
        nextDay.add(1, 'years')
        for (let [day, month] of dates.slice(1)) {
          if (m.isBefore(immediately)) {
            m.month(month)
            m.date(day)
            nextDay.month(month)
            nextDay.date(day)
          } else {
            nextDay.month(month)
            nextDay.date(day)
            break l1
          }
        }
      }

      break
    case 'weekdayInMonth':
      const dates2 = data.weekdayInMonth.map(_weekdayMapper(immediately.clone()))
      .concat(data.weekdayInMonth.map(_weekdayMapper(immediately.clone().add(1, 'months'))))
      .sort((a, b) => a.isBefore(b) ? -1 : (a.isAfter(b) ? 1 : 0))
      .map(d => d.hour(now.hour()).minute(now.minute()).seconds(now.seconds()))

      nextDay = dates2.shift()
      do {
        m = nextDay
        nextDay = dates2.shift()
      } while (m && m.isBefore(immediately))
  }

  m.hour(0)
  m.minute(0)
  m.second(0)
  if (nextDay) {
    nextDay.hour(0)
    nextDay.minute(0)
    nextDay.second(0)
  }

  let day

  l2: switch (data.timeMode) {
    case 'hourMinute':
      const times = data.hourMinute.sort().map((hm) => hm.split(':'))
      for (let [hour, minute] of times) {
        m.hour(hour)
        m.minute(minute)
        m.second(0)
        if (m.isAfter(immediately)) {
          break l2
        }
      }

      // if here, then every times are in the past. Use nextDay
      m = nextDay
      for (let [hour, minute] of times) {
        m.hour(hour)
        m.minute(minute)
        m.second(0)
        if (m.isAfter(immediately)) {
          break l2
        }
      }
      return null // cannot schedule... but cannot occurs I think.

    case 'eachQuarter':
      day = m.date()
      while (m.isBefore(immediately) && m.date() === day) {
        m.add(15, 'minutes')
      }
      if (m.isAfter(immediately) && m.date() === day) {
        break l2
      }
      // if here, then next quarter is in the next day. Use nextDay
      m = nextDay
      day = m.date()
      while (m.isBefore(immediately) && m.date() === day) {
        m.add(15, 'minutes')
      }
      if (m.isAfter(immediately) && m.date() === day) {
        break l2
      }
      return null // cannot schedule... but cannot occurs I think.

    case 'eachHalf':
      day = m.date()
      while (m.isBefore(immediately) && m.date() === day) {
        m.add(30, 'minutes')
      }
      if (m.isAfter(immediately) && m.date() === day) {
        break l2
      }
      // if here, then next quarter is in the next day. Use nextDay
      m = nextDay
      day = m.date()
      while (m.isBefore(immediately) && m.date() === day) {
        m.add(30, 'minutes')
      }
      if (m.isAfter(immediately) && m.date() === day) {
        break l2
      }
      return null // cannot schedule... but cannot occurs I think.

    case 'eachHour':
      day = m.date()
      while (m.isBefore(immediately) && m.date() === day) {
        m.add(1, 'hours')
      }
      if (m.isAfter(immediately) && m.date() === day) {
        break l2
      }
      // if here, then next quarter is in the next day. Use nextDay
      m = nextDay
      day = m.date()
      while (m.isBefore(immediately) && m.date() === day) {
        m.add(1, 'hours')
      }
      if (m.isAfter(immediately) && m.date() === day) {
        break l2
      }
      return null // cannot schedule... but cannot occurs I think.
  }

  return moment.duration(m.diff(now)) // gets duration between now and the target instant
}

export { _getWaitDuration, _weekdayMapper }

export default class ServerTimeBasedTrigger extends ServerTrigger {
  constructor (data) {
    super(data)
    this.schedule = null
  }

  get name () {
    return this.data.name ? `Time reached ${this.data.name}` : `Misconfigured time based trigger`
  }

  reschedule () {
    this.cancelEvents()
    if (this.listeners.filter((l) => !l.lazy).length === 0) {
      ServerTimeBasedTrigger.logger.info(`Trigger ${this.data.name} has no active listener. Trigger unscheduled.`)
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
    try {
      const duration = _getWaitDuration(this.data)
      if (duration) {
        duration.timer({ start: true }, () => {
          this.listeners.forEach((listener) => listener())
          this.reschedule()
        })
        return Promise.resolve(true)
      }

      return Promise.resolve(false)
    } catch (error) {
      return Promise.reject(error)
    }
  }
}
