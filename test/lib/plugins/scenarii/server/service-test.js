/* eslint-env mocha */
/* eslint-disable no-unused-expressions */
'use strict'

import { expect } from 'chai'

// import DataHandler from '../../../../../lib/server/data-handler.js'
import DataHandler from '../../../../helpers/data-handler.js'
import Logger from '../../../../helpers/logger.js'
import notificationHandler from '../../../../helpers/notification-handler.js'

import ServerService, { _getEnergyPricing } from '../../../../../lib/plugins/scenarii/server/service.js'
import ServerProcedure from '../../../../../lib/plugins/scenarii/base-elements/procedure/server.js'

describe('Plugin scenarii - server service', function () {
  before(function () {
    const logger = new Logger()
    const dataHandler = new DataHandler('test', logger)
    this.service = new ServerService({
      getServices: () => ({}),
      logger,
      dataHandler,
      notificationHandler
    })
  })

  it('Service can list action types', function () {
    const actionTypes = this.service.getActionTypes()
    expect(actionTypes).to.be.an.instanceof(Array)
    expect(actionTypes).to.have.lengthOf.above(0)
    expect(actionTypes).to.include('base-procedure')
  })

  it('Service can create a new \'base-procedure\' action', function () {
    return this.service.createActionInstance('base-procedure')
      .then((newProcedureAction) => {
        expect(newProcedureAction).to.be.an.instanceof(ServerProcedure)
        expect(newProcedureAction.data).to.be.an.instanceof(Object)
        expect(newProcedureAction.instanceId).to.be.not.null
      })
  })

  it('Service can create, save and get again a simple \'base-procedure\' action', function () {
    return this.service.createActionInstance('base-procedure')
      .then((newProcedureAction) => {
        return this.service.setActionInstance(newProcedureAction)
          .then(() => this.service.getActionInstance(newProcedureAction.instanceId))
          .then((procedure) => {
            expect(newProcedureAction.constructor).to.equal(procedure.constructor)
            expect(newProcedureAction.data).to.deep.equal(procedure.data)
            expect(newProcedureAction.instanceId).to.equal(procedure.instanceId)
          })
      })
  })

  it('Service can create, save and delete a simple \'base-procedure\' action', function (done) {
    this.service.createActionInstance('base-procedure')
      .then((newProcedureAction) => {
        this.service.setActionInstance(newProcedureAction)
          .then(() => this.service.getActionInstance(newProcedureAction.instanceId))
          .then((procedure) => {
            expect(procedure).to.exist
            return this.service.deleteActionInstance(procedure)
              .then((result) => {
                expect(result).to.be.true
                return this.service.getActionInstance(procedure.instanceId)
                  .then((action) => {
                    expect(action).to.be.null
                    done()
                  })
              })
          })
      })
  })

  it('Service can get the previously created \'base-procedure\' actions in a list', function () {
    return this.service.getActionInstances()
      .then((results) => {
        expect(results).to.have.lengthOf(1)
        expect(results[0]).to.have.property('typeId')
        expect(results[0]).to.have.property('instanceId')
        expect(results[0].typeId).to.equal('base-procedure')
      })
  })

  it('Service sub-function _getEnergyPricing can get right pricing given basic settings', function () {
    const settings = {
      prices: [54, 55, 56, 57, 58, 59],
      planningBase: [3, 1, 5, 4, 3, 2, 1],
      planningOthers: [[], [], [], [], [], [], []]
    }
    expect(_getEnergyPricing(settings, new Date('2018-08-14T08:25:05+02:00'))).to.equal(59) // tuesday
    expect(_getEnergyPricing(settings, new Date('2018-08-13T08:25:05+02:00'))).to.equal(55) // monday
    expect(_getEnergyPricing(settings, new Date('2018-08-12T08:25:05+02:00'))).to.equal(57) // sunday
  })

  it('Service sub-function _getEnergyPricing can get right pricing given specific settings', function () {
    const settings = {
      prices: [43, 44, 45, 46, 47, 48, 49],
      planningBase: [0, 1, 2, 3, 4, 5, 6],
      planningOthers: [[], [], [ // tuesday
        { hour: 8 * 60, pricing: 6 }
      ], [ // wednesday
        { hour: 7 * 60, pricing: 4 },
        { hour: 9 * 60, pricing: 5 }
      ], [], [], []]
    }
    expect(_getEnergyPricing(settings, new Date('2018-08-14T08:25:05+02:00'))).to.equal(49) // tuesday
    expect(_getEnergyPricing(settings, new Date('2018-08-14T07:25:05+02:00'))).to.equal(45) // tuesday
    expect(_getEnergyPricing(settings, new Date('2018-08-15T07:25:05+02:00'))).to.equal(47) // wednesday
    expect(_getEnergyPricing(settings, new Date('2018-08-15T06:25:05+02:00'))).to.equal(46) // wednesday
    expect(_getEnergyPricing(settings, new Date('2018-08-15T09:25:05+02:00'))).to.equal(48) // wednesday
  })

  it('Service sub-function _getEnergyPricing can get right pricing given specific settings, borderline cases', function () {
    const settings = {
      prices: [43, 44, 45, 46, 47, 48, 49],
      planningBase: [0, 1, 2, 3, 4, 5, 6],
      planningOthers: [[], [], [ // tuesday
        { hour: 8 * 60, pricing: 6 }
      ], [ // wednesday
        { hour: 7 * 60, pricing: 4 },
        { hour: 9 * 60, pricing: 5 }
      ], [], [], []]
    }
    expect(_getEnergyPricing(settings, new Date('2018-08-14T00:00:00+02:00'))).to.equal(45) // tuesday
    expect(_getEnergyPricing(settings, new Date('2018-08-14T08:00:00+02:00'))).to.equal(49) // tuesday
    expect(_getEnergyPricing(settings, new Date('2018-08-14T07:59:59+02:00'))).to.equal(45) // tuesday
    expect(_getEnergyPricing(settings, new Date('2018-08-15T07:00:00+02:00'))).to.equal(47) // wednesday
    expect(_getEnergyPricing(settings, new Date('2018-08-15T06:59:59+02:00'))).to.equal(46) // wednesday
    expect(_getEnergyPricing(settings, new Date('2018-08-15T09:00:00+02:00'))).to.equal(48) // wednesday
    expect(_getEnergyPricing(settings, new Date('2018-08-15T08:59:59+02:00'))).to.equal(47) // wednesday
  })
})
