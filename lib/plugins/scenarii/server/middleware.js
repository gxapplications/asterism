'use strict'

import ScenariiService from './service'

let _service = null

const middleware = (context, router) => {
  const logger = context.logger
  const dataHandler = context.dataHandler
  const notificationHandler = context.notificationHandler

  router.connectPlugin = (getServices) => {
    const privateSocket = context.privateSocketIo
    const publicSockets = context.publicSocketsIo

    privateSocket.on('connection', (socket) => {
      // Actions
      socket.on('getActionTypes', (callback) => {
        callback(_service.getActionTypes())
      })
      socket.on('getActionInstances', (callback) => {
        _service.getActionInstances()
        .then(callback)
      })
      socket.on('createActionInstance', (typeId, callback) => {
        _service.createActionInstance(typeId)
        .then(callback)
      })
      socket.on('setActionInstance', (instanceData, callback) => {
        _service.setActionData(instanceData)
        .then(callback)
      })
      socket.on('deleteActionInstance', (instanceData, callback) => {
        _service.deleteActionInstance(instanceData)
        .then(callback)
      })
      socket.on('testActionInstance', (instanceData, callback) => {
        _service.testActionData(instanceData)
        .then(callback)
      })

      // Conditions
      socket.on('getConditionTypes', (callback) => {
        callback(_service.getConditionTypes())
      })
      socket.on('getConditionInstances', (callback) => {
        _service.getConditionInstances()
        .then(callback)
      })
      socket.on('createConditionInstance', (typeId, callback) => {
        _service.createConditionInstance(typeId)
        .then(callback)
      })
      socket.on('setConditionInstance', (instanceData, callback) => {
        _service.setConditionData(instanceData)
        .then(callback)
      })
      socket.on('deleteConditionInstance', (instanceData, callback) => {
        _service.deleteConditionInstance(instanceData)
        .then(callback)
      })

      // Triggers
      socket.on('getTriggerTypes', (callback) => {
        callback(_service.getTriggerTypes())
      })
      socket.on('getTriggerInstances', (callback) => {
        _service.getTriggerInstances()
        .then(callback)
      })
      socket.on('createTriggerInstance', (typeId, callback) => {
        _service.createTriggerInstance(typeId)
        .then(callback)
      })
      socket.on('setTriggerInstance', (instanceData, callback) => {
        _service.setTriggerData(instanceData)
        .then(callback)
      })
      socket.on('deleteTriggerInstance', (instanceData, callback) => {
        _service.deleteTriggerInstance(instanceData)
        .then(callback)
      })

      // TODO !2: same for scenarii?
    })

    // Instantiate and Register base elements
    _service = new ScenariiService({ getServices, logger, dataHandler, notificationHandler, privateSocket, publicSockets })
    return _service
  }

  return router
}

export default middleware
