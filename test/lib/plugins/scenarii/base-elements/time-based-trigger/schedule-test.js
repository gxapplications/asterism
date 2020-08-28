/* eslint-env mocha */
'use strict'

import { expect } from 'chai'
import moment from 'moment'

import { _getWaitDuration, _weekdayMapper } from '../../../../../../lib/plugins/scenarii/base-elements/time-based-trigger/server.js'

describe('Plugin scenarii - time based trigger scheduling,', function () {
  it('Can schedule for same day, based on weekdays dayMode', function () {
    const now = moment('2018-03-13T13:30:05.123+01:00') // This is a Tuesday (index #2)
    const duration = _getWaitDuration({
      dayMode: 'weekdays',
      timeMode: 'hourMinute', // so, specific hour
      weekdays: [2], // so, same day
      hourMinute: ['14:04'] // 10:04 < 13:30, so prefer same day next week
    }, now)
    expect(now.add(duration, 'milliseconds').toISOString()).to.equal('2018-03-13T13:04:00.000Z')
  })

  it('Can schedule tomorrow, based on weekdays dayMode', function () {
    const now = moment('2018-03-13T13:30:05.123+01:00') // This is a Tuesday (index #2)
    const duration = _getWaitDuration({
      dayMode: 'weekdays',
      timeMode: 'hourMinute', // so, specific hour
      weekdays: [3], // so, tomorrow
      hourMinute: ['23:56']
    }, now)
    expect(now.add(duration, 'milliseconds').toISOString()).to.equal('2018-03-14T22:56:00.000Z')
  })

  it('Can schedule (if time passed) for next week, same day, based on weekdays dayMode', function () {
    const now = moment('2018-03-13T13:30:05.123+01:00') // This is a Tuesday (index #2)
    const duration = _getWaitDuration({
      dayMode: 'weekdays',
      timeMode: 'hourMinute', // so, specific hour
      weekdays: [2], // so, same day (or same day next week)
      hourMinute: ['10:04'] // 10:04 < 13:30, so prefer same day next week
    }, now)
    expect(now.add(duration, 'milliseconds').toISOString()).to.equal('2018-03-20T09:04:00.000Z')
  })

  it('Can schedule for closest checked weekday, based on weekdays dayMode', function () {
    const now = moment('2018-03-13T13:30:05.123+01:00') // This is a Tuesday (index #2)
    const duration = _getWaitDuration({
      dayMode: 'weekdays',
      timeMode: 'hourMinute', // so, specific hour
      weekdays: [2, 3, 5], // so, tomorrow
      hourMinute: ['15:05']
    }, now)
    expect(now.add(duration, 'milliseconds').toISOString()).to.equal('2018-03-13T14:05:00.000Z')
  })

  it('Can schedule (if time passed) for closest checked weekday, based on weekdays dayMode', function () {
    const now = moment('2018-03-13T13:30:05.123+01:00') // This is a Tuesday (index #2)
    const duration = _getWaitDuration({
      dayMode: 'weekdays',
      timeMode: 'hourMinute', // so, specific hour
      weekdays: [2, 3, 5], // so, tomorrow
      hourMinute: ['10:05']
    }, now)
    expect(now.add(duration, 'milliseconds').toISOString()).to.equal('2018-03-14T09:05:00.000Z')
  })

  it('Can schedule for closest day, based on dayInMonth dayMode', function () {
    const now = moment('2018-03-13T13:30:05.123+01:00') // This is a Tuesday (index #2)
    const duration = _getWaitDuration({
      dayMode: 'dayInMonth',
      timeMode: 'hourMinute',
      dayInMonth: [19, 7, 15, 17],
      hourMinute: ['16:05']
    }, now)
    expect(now.add(duration, 'milliseconds').toISOString()).to.equal('2018-03-15T15:05:00.000Z')
  })

  it('Can schedule for next month day, based on dayInMonth dayMode', function () {
    const now = moment('2018-02-13T13:30:05.123+01:00')
    const duration = _getWaitDuration({
      dayMode: 'dayInMonth',
      timeMode: 'hourMinute',
      dayInMonth: [11, 9, 12],
      hourMinute: ['16:05']
    }, now)
    expect(now.add(duration, 'milliseconds').toISOString()).to.equal('2018-03-09T15:05:00.000Z')
  })

  it('Can schedule for closest day when only 1 day, based on dayInMonth dayMode', function () {
    const now = moment('2018-03-13T13:30:05.123+01:00') // This is a Tuesday (index #2)
    const duration = _getWaitDuration({
      dayMode: 'dayInMonth',
      timeMode: 'hourMinute',
      dayInMonth: [19],
      hourMinute: ['16:05']
    }, now)
    expect(now.add(duration, 'milliseconds').toISOString()).to.equal('2018-03-19T15:05:00.000Z')
  })

  it('Can schedule for closest day when only 1 day (in the past), based on dayInMonth dayMode', function () {
    const now = moment('2018-02-13T13:30:05.123+01:00')
    const duration = _getWaitDuration({
      dayMode: 'dayInMonth',
      timeMode: 'hourMinute',
      dayInMonth: [6],
      hourMinute: ['16:05']
    }, now)
    expect(now.add(duration, 'milliseconds').toISOString()).to.equal('2018-03-06T15:05:00.000Z')
  })

  it('Can schedule for closest 31th, based on dayInMonth dayMode', function () {
    const now = moment('2018-01-13T13:30:05.123+01:00') // This is a Tuesday (index #2)
    const duration = _getWaitDuration({
      dayMode: 'dayInMonth',
      timeMode: 'hourMinute',
      dayInMonth: [31],
      hourMinute: ['16:05']
    }, now)
    expect(now.add(duration, 'milliseconds').toISOString()).to.equal('2018-01-31T15:05:00.000Z')
  })

  it('Can schedule for closest 31th (2), based on dayInMonth dayMode', function () {
    const now = moment('2018-02-13T13:30:05.123+01:00') // This is a Tuesday (index #2)
    const duration = _getWaitDuration({
      dayMode: 'dayInMonth',
      timeMode: 'hourMinute',
      dayInMonth: [31],
      hourMinute: ['16:05']
    }, now)
    expect(now.add(duration, 'milliseconds').toISOString()).to.equal('2018-03-31T14:05:00.000Z')
  })

  it('Can schedule for closest 1th jan, based on dayInMonth dayMode', function () {
    const now = moment('2018-01-01T13:30:05.123+01:00') // This is a Tuesday (index #2)
    const duration = _getWaitDuration({
      dayMode: 'dayInMonth',
      timeMode: 'hourMinute',
      dayInMonth: [1],
      hourMinute: ['16:05']
    }, now)
    expect(now.add(duration, 'milliseconds').toISOString()).to.equal('2018-01-01T15:05:00.000Z')
  })

  it('Can schedule for closest 29th feb, based on dayInMonth dayMode', function () {
    const now = moment('2000-02-13T13:30:05.123+01:00')
    const duration = _getWaitDuration({
      dayMode: 'dayInMonth',
      timeMode: 'hourMinute',
      dayInMonth: [29],
      hourMinute: ['16:05']
    }, now)
    expect(now.add(duration, 'milliseconds').toISOString()).to.equal('2000-02-29T15:05:00.000Z')
  })

  it('Can schedule for closest 29th when no 29th feb in the year, based on dayInMonth dayMode', function () {
    const now = moment('2001-02-13T13:30:05.123+01:00')
    const duration = _getWaitDuration({
      dayMode: 'dayInMonth',
      timeMode: 'hourMinute',
      dayInMonth: [29],
      hourMinute: ['16:05']
    }, now)
    expect(now.add(duration, 'milliseconds').toISOString()).to.equal('2001-03-29T14:05:00.000Z')
  })

  it('Can schedule for closest date this year, based on dayAndMonth dayMode', function () {
    const now = moment('2018-02-13T13:30:05.123+01:00')
    const duration = _getWaitDuration({
      dayMode: 'dayAndMonth',
      timeMode: 'hourMinute',
      dayAndMonth: [110], // 15th march
      hourMinute: ['16:05']
    }, now)
    expect(now.add(duration, 'milliseconds').toISOString()).to.equal('2018-03-15T15:05:00.000Z')
  })

  it('Can schedule for closest date next year, based on dayAndMonth dayMode', function () {
    const now = moment('2018-03-13T13:30:05.123+01:00')
    const duration = _getWaitDuration({
      dayMode: 'dayAndMonth',
      timeMode: 'hourMinute',
      dayAndMonth: [107], // 12th march
      hourMinute: ['16:05']
    }, now)
    expect(now.add(duration, 'milliseconds').toISOString()).to.equal('2019-03-12T15:05:00.000Z')
  })

  it('Can schedule for closest 29th feb, based on dayAndMonth dayMode', function () {
    const now = moment('2000-02-13T13:30:05.123+01:00')
    const duration = _getWaitDuration({
      dayMode: 'dayAndMonth',
      timeMode: 'hourMinute',
      dayAndMonth: [92], // 29th feb
      hourMinute: ['16:05']
    }, now)
    expect(now.add(duration, 'milliseconds').toISOString()).to.equal('2000-02-29T15:05:00.000Z')
  })

  it('Can schedule for closest 29th feb when not in the year => 1st march, based on dayAndMonth dayMode', function () {
    const now = moment('2001-02-13T13:30:05.123+01:00')
    const duration = _getWaitDuration({
      dayMode: 'dayAndMonth',
      timeMode: 'hourMinute',
      dayAndMonth: [92], // 29th feb
      hourMinute: ['16:05']
    }, now)
    expect(now.add(duration, 'milliseconds').toISOString()).to.equal('2001-03-01T15:05:00.000Z')
  })

  it('Can schedule for next quarter hour', function () {
    const now = moment('2018-03-13T13:30:05.123+01:00') // This is a Tuesday (index #2)
    const duration = _getWaitDuration({
      dayMode: 'weekdays',
      timeMode: 'eachQuarter',
      weekdays: [2] // so, same day
    }, now)
    expect(now.add(duration, 'milliseconds').toISOString()).to.equal('2018-03-13T12:45:00.000Z')
  })

  it('Can schedule for next quarter hour (limit case)', function () {
    const now = moment('2018-03-13T13:30:00.000+01:00') // This is a Tuesday (index #2)
    const duration = _getWaitDuration({
      dayMode: 'weekdays',
      timeMode: 'eachQuarter',
      weekdays: [2] // so, same day
    }, now)
    expect(now.add(duration, 'milliseconds').toISOString()).to.equal('2018-03-13T12:45:00.000Z')
  })

  it('Can schedule for next quarter hour (limit case 2)', function () {
    const now = moment('2018-03-13T13:00:00.000+01:00') // This is a Tuesday (index #2)
    const duration = _getWaitDuration({
      dayMode: 'weekdays',
      timeMode: 'eachQuarter',
      weekdays: [2] // so, same day
    }, now)
    expect(now.add(duration, 'milliseconds').toISOString()).to.equal('2018-03-13T12:15:00.000Z')
  })

  it('Can schedule for next quarter hour (next day case)', function () {
    const now = moment('2018-03-13T23:49:00.000+01:00') // This is a Tuesday (index #2)
    const duration = _getWaitDuration({
      dayMode: 'weekdays',
      timeMode: 'eachQuarter',
      weekdays: [2, 4] // so, 2 days later
    }, now)
    expect(now.add(duration, 'milliseconds').toISOString()).to.equal('2018-03-14T23:00:00.000Z')
  })

  it('Can schedule for next quarter hour (limit case 3)', function () {
    const now = moment('2018-03-13T00:00:00.000+01:00') // This is a Tuesday (index #2)
    const duration = _getWaitDuration({
      dayMode: 'weekdays',
      timeMode: 'eachQuarter',
      weekdays: [2, 4] // so, 2 days later
    }, now)
    expect(now.add(duration, 'milliseconds').toISOString()).to.equal('2018-03-12T23:15:00.000Z')
  })

  it('Can schedule for next half hour', function () {
    const now = moment('2018-03-13T13:30:05.123+01:00') // This is a Tuesday (index #2)
    const duration = _getWaitDuration({
      dayMode: 'weekdays',
      timeMode: 'eachHalf',
      weekdays: [2] // so, same day
    }, now)
    expect(now.add(duration, 'milliseconds').toISOString()).to.equal('2018-03-13T13:00:00.000Z')
  })

  it('Can schedule for next round hour', function () {
    const now = moment('2018-03-13T13:10:05.123+01:00') // This is a Tuesday (index #2)
    const duration = _getWaitDuration({
      dayMode: 'weekdays',
      timeMode: 'eachHour',
      weekdays: [2] // so, same day
    }, now)
    expect(now.add(duration, 'milliseconds').toISOString()).to.equal('2018-03-13T13:00:00.000Z')
  })

  it('Can use weedayInMonth mapper', function () {
    const now = moment('2018-03-13T13:30:05.123+01:00') // This is a Tuesday (index #2)
    const immediately = now.clone() // considers this is NOW. Cannot schedule a task before that.
    immediately.add(1, 'seconds')
    expect(
      [
        [1, 2],
        [2, 2],
        [1, 4],
        [1, 3],
        [9, 0],
        [8, 0],
        [4, 6]
      ]
        .map(([o, d]) => _weekdayMapper(immediately.clone())([o, d])) // clone each time to avoid side effects
        .map(t => t.toISOString(true))
    ).to.deep.equal([
      '2018-03-06T00:00:00.000+01:00',
      '2018-03-13T00:00:00.000+01:00',
      '2018-03-01T00:00:00.000+01:00',
      '2018-03-07T00:00:00.000+01:00',
      '2018-03-25T00:00:00.000+01:00',
      '2018-03-18T00:00:00.000+01:00',
      '2018-03-24T00:00:00.000+01:00'
    ])
  })

  it('Can schedule for closest Nth weekday of the month, based on weekdayInMonth dayMode', function () {
    const now = moment('2018-03-13T13:10:05.123+01:00') // This is a Tuesday (index #2)
    const duration = _getWaitDuration({
      dayMode: 'weekdayInMonth',
      timeMode: 'hourMinute',
      weekdayInMonth: [[8, 0]], // so, 2018-03-18
      hourMinute: ['16:05']
    }, now)
    expect(now.add(duration, 'milliseconds').toISOString()).to.equal('2018-03-18T15:05:00.000Z')
  })

  it('Can schedule for next Nth weekday of the month if the closest is in the past, based on weekdayInMonth dayMode', function () {
    const now = moment('2018-03-13T13:10:05.123+01:00') // This is a Tuesday (index #2)
    const duration = _getWaitDuration({
      dayMode: 'weekdayInMonth',
      timeMode: 'hourMinute',
      weekdayInMonth: [[1, 2]], // so, 2018-03-06. It's in the past, so will jump to 04-03
      hourMinute: ['16:05']
    }, now)
    expect(now.add(duration, 'milliseconds').toISOString()).to.equal('2018-04-03T14:05:00.000Z')
  })

  it('Can schedule for next Nth weekday of the month if the closest is today, based on weekdayInMonth dayMode', function () {
    const now = moment('2018-03-13T13:10:05.123+01:00') // This is a Tuesday (index #2)
    const duration = _getWaitDuration({
      dayMode: 'weekdayInMonth',
      timeMode: 'hourMinute',
      weekdayInMonth: [[2, 2]], // so, 2018-03-13. It's today, and time is passed so will jump to 04-10
      hourMinute: ['10:05']
    }, now)
    expect(now.add(duration, 'milliseconds').toISOString()).to.equal('2018-04-10T08:05:00.000Z')
  })
})
