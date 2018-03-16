/* eslint-env mocha */
/* eslint-disable no-unused-expressions */
'use strict'

import { expect } from 'chai'

// import DataHandler from '../../../../../lib/server/data-handler.js'
import DataHandler from '../../../../helpers/data-handler.js'
import Logger from '../../../../helpers/logger.js'
import notificationHandler from '../../../../helpers/notification-handler.js'

import ServerService from '../../../../../lib/plugins/scenarii/server/service.js'
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
})
