/* eslint-env mocha */
'use strict'

import { expect } from 'chai'
import moment from 'moment'

import { _getWaitDuration } from '../../../../../../lib/plugins/scenarii/base-elements/astral-time-trigger/server.js'

describe('Plugin scenarii - astral time trigger scheduling,', function () {
  const lat = 48.8566 // Paris
  const long = 2.3522

  it('Can schedule for sunrise today', function () {
    const now = moment('2018-07-19T02:00:00.123+01:00')
    const duration = _getWaitDuration({
      event: 'sunrise'
    }, lat, long, now)
    expect(now.add(duration, 'milliseconds').toISOString()).to.equal('2018-07-19T04:08:28.000Z')
  })

  it('Can schedule for sunrise tomorrow', function () {
    const now = moment('2018-07-19T11:00:00.123+01:00')
    const duration = _getWaitDuration({
      event: 'sunrise',
      limitedWindowLow: 6 * 60
    }, lat, long, now)
    expect(now.add(duration, 'milliseconds').toISOString()).to.equal('2018-07-20T04:09:37.000Z')
  })

  it('Can schedule for sunrise today, 1hour timeshift', function () {
    const now = moment('2018-07-19T02:00:00.123+01:00')
    const duration = _getWaitDuration({
      event: 'sunrise',
      timeshift: 60 // +1hr
    }, lat, long, now)
    expect(now.add(duration, 'milliseconds').toISOString()).to.equal('2018-07-19T05:08:28.000Z')
  })

  it('Can schedule for sunrise today, -3hours timeshift', function () {
    const now = moment('2018-07-19T02:00:00.123+01:00')
    const duration = _getWaitDuration({
      event: 'sunrise',
      timeshift: -180 // +1hr
    }, lat, long, now)
    expect(now.add(duration, 'milliseconds').toISOString()).to.equal('2018-07-19T01:08:28.000Z')
  })

  it('Can schedule for sunset today', function () {
    const now = moment('2018-07-20T08:00:00.123+01:00')
    const duration = _getWaitDuration({
      event: 'sunset'
    }, lat, long, now)
    expect(now.add(duration, 'milliseconds').toISOString()).to.equal('2018-07-20T19:46:27.000Z')
  })

  it('Can schedule for sunset tomorrow', function () {
    const now = moment('2018-07-20T23:00:00.123+01:00')
    const duration = _getWaitDuration({
      event: 'sunset'
    }, lat, long, now)
    expect(now.add(duration, 'milliseconds').toISOString()).to.equal('2018-07-21T19:45:23.000Z')
  })

  it('Can schedule for night today', function () {
    const now = moment('2018-07-20T02:00:00.123+01:00')
    const duration = _getWaitDuration({
      event: 'night'
    }, lat, long, now)
    expect(now.add(duration, 'milliseconds').toISOString()).to.equal('2018-07-20T22:34:17.000Z')
  })

  it('Can schedule for solarNoon today', function () {
    const now = moment('2018-07-20T02:00:00.123+01:00')
    const duration = _getWaitDuration({
      event: 'solarNoon'
    }, lat, long, now)
    expect(now.add(duration, 'milliseconds').toISOString()).to.equal('2018-07-20T11:58:02.000Z')
  })

  it('Can schedule for sunrise in polar circle specific case (no sunrise for days...)', function () {
    const now = moment('2018-07-20T02:00:00.123+01:00') // next sunrise on 23rd, 1hr14
    const duration = _getWaitDuration({
      event: 'sunset'
    }, 68.9585, 33.0827, now) // Murmansk city, Russia, 68.9585° N, 33.0827° E
    expect(now.add(duration, 'milliseconds').toISOString()).to.equal('2018-07-23T21:31:54.000Z') // time gap in Russia...
  })

  it('Can schedule for sunrise today, but limited to 8:00', function () {
    const now = moment('2018-07-19T02:00:00.123+01:00')
    const duration = _getWaitDuration({
      event: 'sunrise',
      limitedWindowLow: 8 * 60
    }, lat, long, now)
    expect(now.add(duration, 'milliseconds').toISOString()).to.equal('2018-07-19T06:00:00.000Z')
  })

  it('Can schedule for sunset today, but limited to 16:00', function () {
    const now = moment('2018-07-20T08:00:00.123+01:00')
    const duration = _getWaitDuration({
      event: 'sunset',
      limitedWindowHigh: 16 * 60
    }, lat, long, now)
    expect(now.add(duration, 'milliseconds').toISOString()).to.equal('2018-07-20T14:00:00.000Z')
  })
})
