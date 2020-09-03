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
      socket.on('getActionInstances', (parent, callback) => {
        _service.getActionInstances(parent)
          .then(callback)
          .catch((error) => callback(null, error.toString())) // eslint-disable-line standard/no-callback-literal
      })
      socket.on('getActionInstance', (instanceId, callback) => {
        _service.getActionInstance(instanceId)
          .then(callback)
          .catch((error) => callback(null, error.toString())) // eslint-disable-line standard/no-callback-literal
      })
      socket.on('createActionInstance', (typeId, callback) => {
        _service.createActionInstance(typeId)
          .then(callback)
      })
      socket.on('setActionInstance', (instanceData, parent, group, callback) => {
        _service.setActionData(instanceData, parent, group)
          .then(callback)
      })
      socket.on('deleteActionInstance', (instanceData, callback) => {
        _service.deleteActionInstance(instanceData)
          .then(callback)
      })
      socket.on('executeActionInstance', (instanceData, executionId, callback) => {
        _service.executeActionData(instanceData, executionId)
          .then(callback)
      })
      socket.on('abortActionInstance', (instanceData, executionId, callback) => {
        _service.abortActionData(instanceData, executionId)
          .then(callback)
      })
      socket.on('actionExecutionState', (executionId, callback) => {
        _service.actionExecutionState(executionId)
          .then(callback)
      })

      // States
      socket.on('getStateTypes', (callback) => {
        callback(_service.getStateTypes())
      })
      socket.on('getStateInstances', (callback) => {
        _service.getStateInstances()
          .then(callback)
          .catch((error) => callback(null, error.toString())) // eslint-disable-line standard/no-callback-literal
      })
      socket.on('getStateInstance', (instanceId, callback) => {
        _service.getStateInstance(instanceId)
          .then(callback)
          .catch((error) => callback(null, error.toString())) // eslint-disable-line standard/no-callback-literal
      })
      socket.on('createStateInstance', (typeId, callback) => {
        _service.createStateInstance(typeId)
          .then(callback)
      })
      socket.on('setStateInstance', (instanceData, callback) => {
        _service.setStateData(instanceData)
          .then(callback)
      })
      socket.on('deleteStateInstance', (instanceData, callback) => {
        _service.deleteStateInstance(instanceData)
          .then(callback)
      })
      socket.on('setStateState', (instanceData, newStateValue, callback) => {
        _service.setStateState(instanceData, newStateValue)
          .then(callback)
          .catch((error) => callback(false, error.toString())) // eslint-disable-line standard/no-callback-literal
      })

      // Conditions
      socket.on('getConditionTypes', (callback) => {
        callback(_service.getConditionTypes())
      })
      socket.on('getConditionInstances', (parent, callback) => {
        _service.getConditionInstances(parent)
          .then(callback)
          .catch((error) => callback(null, error.toString())) // eslint-disable-line standard/no-callback-literal
      })
      socket.on('getConditionInstance', (instanceId, callback) => {
        _service.getConditionInstance(instanceId)
          .then(callback)
          .catch((error) => callback(null, error.toString())) // eslint-disable-line standard/no-callback-literal
      })
      socket.on('createConditionInstance', (typeId, callback) => {
        _service.createConditionInstance(typeId)
          .then(callback)
      })
      socket.on('setConditionInstance', (instanceData, parent, group, callback) => {
        _service.setConditionData(instanceData, parent, group)
          .then(callback)
      })
      socket.on('deleteConditionInstance', (instanceData, callback) => {
        _service.deleteConditionInstance(instanceData)
          .then(callback)
      })
      socket.on('testConditionInstance', (instanceData, callback) => {
        _service.testConditionInstance(instanceData)
          .then(callback)
      })

      // Triggers
      socket.on('getTriggerTypes', (callback) => {
        callback(_service.getTriggerTypes())
      })
      socket.on('getTriggerInstances', (parent, callback) => {
        _service.getTriggerInstances(parent)
          .then(callback)
          .catch((error) => callback(null, error.toString())) // eslint-disable-line standard/no-callback-literal
      })
      socket.on('getTriggerInstance', (instanceId, callback) => {
        _service.getTriggerInstance(instanceId)
          .then(callback)
          .catch((error) => callback(null, error.toString())) // eslint-disable-line standard/no-callback-literal
      })
      socket.on('createTriggerInstance', (typeId, callback) => {
        _service.createTriggerInstance(typeId)
          .then(callback)
      })
      socket.on('setTriggerInstance', (instanceData, parent, group, callback) => {
        _service.setTriggerData(instanceData, parent, group)
          .then(callback)
      })
      socket.on('deleteTriggerInstance', (instanceData, callback) => {
        _service.deleteTriggerInstance(instanceData)
          .then(callback)
      })
      socket.on('rescheduleAllTriggers', (callback) => {
        _service.rescheduleAllTriggers()
          .then(callback)
      })

      // Scenarii
      socket.on('getScenarioTypes', (callback) => {
        callback(_service.getScenarioTypes())
      })
      socket.on('getScenarioInstances', (callback) => {
        _service.getScenarioInstances()
          .then(callback)
          .catch((error) => callback(null, error.toString())) // eslint-disable-line standard/no-callback-literal
      })
      socket.on('getScenarioInstance', (instanceId, callback) => {
        _service.getScenarioInstance(instanceId)
          .then(callback)
          .catch((error) => callback(null, error.toString())) // eslint-disable-line standard/no-callback-literal
      })
      socket.on('createScenarioInstance', (typeId, callback) => {
        _service.createScenarioInstance(typeId)
          .then(callback)
      })
      socket.on('setScenarioInstance', (instanceData, group, callback) => {
        _service.setScenarioData(instanceData, group)
          .then(callback)
      })
      socket.on('deleteScenarioInstance', (instanceData, callback) => {
        _service.deleteScenarioInstance(instanceData)
          .then(callback)
      })
      socket.on('forceTriggerScenarioInstance', (instanceData, executionId, callback) => {
        _service.forceTriggerScenarioInstance(instanceData, executionId)
          .then(callback)
      })
      socket.on('forceAbortScenarioInstance', (instanceData, executionId, callback) => {
        _service.forceAbortScenarioInstance(instanceData, executionId)
          .then(callback)
          .catch((error) => callback(false, error.toString())) // eslint-disable-line standard/no-callback-literal
      })
      socket.on('setActivationScenarioInstance', (instanceData, activate, callback) => {
        // emit only a part of the object to avoid max call stack exception in socket.io
        const { data, instanceId, activated } = _service.setActivationScenarioInstance(instanceData, activate)
        callback({ data, instanceId, activated }) // eslint-disable-line standard/no-callback-literal
      })

      // Others
      socket.on('getCities', (pattern, callback) => {
        _service.getCities(pattern)
          .then(callback)
      })
    })

    // Instantiate and Register base elements
    _service = new ScenariiService({ getServices, logger, dataHandler, notificationHandler, privateSocket, publicSockets })
    return _service
  }

  return router
}

export default middleware
