/* eslint-env mocha */
'use strict'

import { expect } from 'chai'
import moment from 'moment'

import { _getWaitDuration } from '../../../../../../lib/plugins/scenarii/base-elements/wait/server.js'

// at 2018-03-25T02:00:00.000+2:00 in France, summer time offset occurs, and then gives 2018-03-25T03:00:00.000+1:00

describe('Plugin scenarii - wait execution', function () {
  it('Can compute a simple wait duration with amount of minutes (+5m)', function () {
    const now = moment('2018-03-13T13:30:05.123+01:00')
    const duration = _getWaitDuration({
      waitMode: 'amount',
      amount: 5,
      amountUnit: 'minutes'
    }, now)
    expect(now.add(duration, 'milliseconds').toISOString()).to.equal('2018-03-13T12:35:05.000Z')
  })

  it('Can compute a 1s duration with amount of seconds (+1s)', function () {
    const now = moment('2018-03-13T13:30:05.123+01:00')
    const duration = _getWaitDuration({
      waitMode: 'amount',
      amount: 1,
      amountUnit: 'seconds'
    }, now)
    expect(now.add(duration, 'milliseconds').toISOString()).to.equal('2018-03-13T12:30:06.000Z')
  })

  it('Will give zero duration for zero amount (+0s)', function () {
    const now = moment('2018-03-13T13:30:05.123+01:00')
    const duration = _getWaitDuration({
      waitMode: 'amount',
      amount: 0,
      amountUnit: 'seconds'
    }, now)
    expect(now.add(duration, 'milliseconds').toISOString()).to.equal('2018-03-13T12:30:05.000Z')
  })

  it('Can compute a 25h duration with amount of hours (+25h)', function () {
    const now = moment('2018-03-13T13:30:05.123+01:00')
    const duration = _getWaitDuration({
      waitMode: 'amount',
      amount: 25,
      amountUnit: 'hours'
    }, now)
    expect(now.add(duration, 'milliseconds').toISOString()).to.equal('2018-03-14T13:30:05.000Z')
  })

  it('Can compute a 24h duration with amount of hours (+24h) without taking summer time shifting effect', function () {
    const now = moment('2018-03-24T13:30:05.123+01:00')
    const duration = _getWaitDuration({
      waitMode: 'amount',
      amount: 24,
      amountUnit: 'hours'
    }, now)
    expect(now.add(duration, 'milliseconds').toISOString()).to.equal('2018-03-25T12:30:05.000Z')
  })

  it('Can compute a 1day duration with amount of hours (+1day) taking summer time shifting effect', function () {
    const now = moment('2018-03-24T13:30:05.123+01:00')
    const duration = _getWaitDuration({
      waitMode: 'amount',
      amount: 1,
      amountUnit: 'days'
    }, now)
    expect(now.add(duration, 'milliseconds').toISOString()).to.equal('2018-03-25T11:30:05.000Z')
  })

  it('Can compute a simple wait duration with until mode (to first occ of 14:25, winter time)', function () {
    const now = moment('2018-03-13T13:30:05.123+01:00')
    const duration = _getWaitDuration({
      waitMode: 'until',
      until: '14:25',
      untilOccurrence: 'first'
    }, now)
    expect(now.add(duration, 'milliseconds').toISOString()).to.equal('2018-03-13T13:25:00.000Z')
  })

  it('Can compute a simple wait duration with until mode (to first occ of 14:25, summer time)', function () {
    const now = moment('2018-03-27T13:30:05.123+02:00')
    const duration = _getWaitDuration({
      waitMode: 'until',
      until: '14:25',
      untilOccurrence: 'first'
    }, now)
    expect(now.add(duration, 'milliseconds').toISOString()).to.equal('2018-03-27T12:25:00.000Z')
  })

  it('Can compute a simple wait duration with until mode (to 14:25 tomorrow)', function () {
    const now = moment('2018-03-13T13:30:05.123+01:00')
    const duration = _getWaitDuration({
      waitMode: 'until',
      until: '14:25',
      untilOccurrence: 'tomorrow'
    }, now)
    expect(now.add(duration, 'milliseconds').toISOString()).to.equal('2018-03-14T13:25:00.000Z')
  })

  it('Can compute a simple wait duration with until mode (to 14:25 tomorrow) without taking summer time shifting effect', function () {
    const now = moment('2018-03-24T13:30:05.123+01:00')
    const duration = _getWaitDuration({
      waitMode: 'until',
      until: '14:25',
      untilOccurrence: 'tomorrow'
    }, now)
    expect(now.add(duration, 'milliseconds').toISOString()).to.equal('2018-03-25T12:25:00.000Z')
  })

  it('Can compute a simple wait duration with untilQuarter mode (to any next round quarter)', function () {
    const now = moment('2018-03-13T13:31:05.123+01:00')
    const duration = _getWaitDuration({
      waitMode: 'untilQuarter',
      untilQuarter: '00/15/30/45'
    }, now)
    expect(now.add(duration, 'milliseconds').toISOString()).to.equal('2018-03-13T12:45:00.000Z')
  })

  it('Can compute a simple wait duration with untilQuarter mode (to any next round quarter, trying 0 case)', function () {
    const now = moment('2018-03-13T13:58:05.123+01:00')
    const duration = _getWaitDuration({
      waitMode: 'untilQuarter',
      untilQuarter: '00/15/30/45'
    }, now)
    expect(now.add(duration, 'milliseconds').toISOString()).to.equal('2018-03-13T13:00:00.000Z')
  })

  it('Can compute a simple wait duration with untilQuarter mode (to any next round half)', function () {
    const now = moment('2018-03-13T13:37:05.123+01:00')
    const duration = _getWaitDuration({
      waitMode: 'untilQuarter',
      untilQuarter: '00/30'
    }, now)
    expect(now.add(duration, 'milliseconds').toISOString()).to.equal('2018-03-13T13:00:00.000Z')
  })

  it('Can compute a simple wait duration with untilQuarter mode (to next XXhr15) crossing midnight', function () {
    const now = moment('2018-03-13T23:37:05.123+01:00')
    const duration = _getWaitDuration({
      waitMode: 'untilQuarter',
      untilQuarter: '15'
    }, now)
    expect(now.add(duration, 'milliseconds').toISOString()).to.equal('2018-03-13T23:15:00.000Z')
  })
})
