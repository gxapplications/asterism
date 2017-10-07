/* eslint-env mocha */
'use strict'

import { expect } from 'chai'

import { _getDayOccurrencesInMonth } from '../../../../../../lib/plugins/scenarii/base-elements/time-based-condition/server.js'

describe('Plugin scenarii - time based condition test,', function () {
  it('Can get all day occurrences for a given date', function () {
    const now = new Date('2018-08-20 00:00:00')
    expect(_getDayOccurrencesInMonth(now)).to.deep.include([8, 1])
    expect(_getDayOccurrencesInMonth(now)).to.deep.include([3, 1])
    expect(_getDayOccurrencesInMonth(now)).to.have.lengthOf(2)
  })

  it('Can get all day occurrences for a 29th feb date', function () {
    const now = new Date('2016-02-29 00:00:00')
    expect(_getDayOccurrencesInMonth(now)).to.deep.include([9, 1])
    expect(_getDayOccurrencesInMonth(now)).to.have.lengthOf(1)
  })

  it('Can get all day occurrences for a non 29th feb date', function () {
    const now = new Date('2018-02-22 00:00:00')
    expect(_getDayOccurrencesInMonth(now)).to.deep.include([4, 4])
    expect(_getDayOccurrencesInMonth(now)).to.deep.include([9, 4])
    expect(_getDayOccurrencesInMonth(now)).to.have.lengthOf(2)
  })
})
