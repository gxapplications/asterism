'use strict'

import { Scenarii } from 'asterism-plugin-library'
import felicity from 'felicity'
import Joi from 'joi'
import uuid from 'uuid'

import baseElements from '../base-elements/server'

const { ServerAction, ServerCondition, ServerTrigger } = Scenarii
const _defaultSchema = Joi.object().keys({ }).unknown(false)
const _schemaSchema = Joi.object().schema()

class _ValidationError extends Error {}

const _getElementInstance = (dataHandler, elementType, typeRepository, instanceId) => {
  return dataHandler.getItem(instanceId)
  .then(({ typeId, type, data }) => {
    if (type !== elementType) {
      throw new Error(`Persisted element instance ${instanceId} is not a ${elementType}.`)
    }
    if (!typeRepository[typeId]) {
      throw new Error(`The ${elementType} type ${typeId} is unknown. Cannot build the persisted instance.`)
    }

    const { ServerClass, dataSchema } = typeRepository[typeId]
    return Joi.validate(data, dataSchema)
    .catch((error) => {
      throw new _ValidationError(error.message)
    })
    .then((fixedData) => {
      const instance = new ServerClass(fixedData)
      instance.instanceId = instanceId
      instance.typeId = typeId
      return instance
    })
  })
}

const _createElementInstance = (elementType, typeRepository, typeId, defaultData, defaultId) => {
  if (!typeRepository[typeId]) {
    return Promise.reject(new Error(`The ${elementType} type ${typeId} is unknown. Cannot create a new instance.`))
    .catch((error) => {
      this.logger.error(error)
      throw error
    })
  }

  const { ServerClass, dataSchema } = typeRepository[typeId]
  const instanceId = defaultId || uuid.v4()
  defaultData = defaultData || felicity.example(dataSchema)

  return Joi.validate(defaultData, dataSchema)
  .catch((error) => {
    throw new _ValidationError(error.message)
  })
  .then((fixedData) => {
    const instance = new ServerClass(fixedData)
    instance.instanceId = instanceId
    instance.typeId = typeId
    return instance
  })
  .catch((error) => {
    this.logger.error(error)
    throw error
  })
}

const _setElementInstance = (dataHandler, elementType, typeRepository, element) => {
  const Clazz = element.constructor
  const type = Object.entries(typeRepository).find((entry) => entry[1].ServerClass === Clazz)
  if (!type) {
    return Promise.reject(new Error(`The ${elementType} type is unknown. Cannot persist this object.`))
    .catch((error) => {
      this.logger.error(error)
      throw error
    })
  }

  return Joi.validate(element.data, type[1].dataSchema)
  .catch((error) => {
    throw new _ValidationError(error.message)
  })
  .then((fixedData) => {
    const typeId = type[0]
    const objectToPersist = {
      typeId: typeId,
      type: elementType,
      data: fixedData
    }
    return dataHandler.setItem(element.instanceId, objectToPersist) // resolves with true when succeed
  })
  .catch((error) => {
    this.logger.error(error)
    throw error
  })
}

const _deleteElementInstance = (dataHandler, instanceId) => {
  return dataHandler.removeItem(instanceId) // resolves with true when succeed
  .catch((error) => {
    this.logger.error(error)
    throw error
  })
}

export default class ScenariiService {
  constructor ({ getServices, logger, dataHandler, notificationHandler, privateSocket, publicSockets }) {
    this.logger = logger
    this.dataHandler = dataHandler
    this.actions = {}
    this.conditions = {}
    this.triggers = {}

    this.actionExecutions = {}

    // Register base elements
    baseElements().forEach(({ id, serverClass, dataSchema }) => {
      this.registerElementType(id, serverClass, dataSchema)
    })
  }

  registerElementType (id, ServerClass, dataSchema = _defaultSchema, TestClass = null) {
    return Joi.validate(dataSchema, _schemaSchema)
    .then(() => {
      TestClass = TestClass || ServerClass
      switch (Object.getPrototypeOf(TestClass) && Object.getPrototypeOf(TestClass).name) {
        case ServerAction.name:
          this.actions[id] = { ServerClass, dataSchema }
          this.logger.log(`Registered ${ServerClass.name} element type as a BrowserAction.`)
          break
        case ServerCondition.name:
          this.conditions[id] = { ServerClass, dataSchema }
          this.logger.log(`Registered ${ServerClass.name} element type as a BrowserCondition.`)
          break
        case ServerTrigger.name:
          this.triggers[id] = { ServerClass, dataSchema }
          this.logger.log(`Registered ${ServerClass.name} element type as a BrowserTrigger.`)
          break
        default:
          if (!Object.getPrototypeOf(TestClass)) {
            this.logger.error(`You are trying to register a scenarii element '${ServerClass.name}' that do not extends a base element!`)
          } else {
            return this.registerElementType(id, ServerClass, dataSchema, Object.getPrototypeOf(TestClass))
          }
      }
    })
    .catch((error) => {
      this.logger.error('The dataSchema you are trying to register is incorrect', error)
    })
  }

  // Actions
  getActionTypes () {
    return Object.keys(this.actions)
  }
  getActionInstances () {
    return this.dataHandler.listItems((i) => i.item.type === 'action')
    .then((results) => results.map((i) => ({ typeId: i.item.typeId, instanceId: i.keyName, data: i.item.data })))
  }
  getActionInstance (instanceId) {
    return _getElementInstance(this.dataHandler, 'action', this.actions, instanceId)
  }
  createActionInstance (typeId) {
    return _createElementInstance('action', this.actions, typeId)
  }
  setActionData (actionData) {
    return _getElementInstance(this.dataHandler, 'action', this.actions, actionData.instanceId)
    .then((action) => {
      action.data = actionData.data
      return action
    })
    .catch((error) => {
      if (error instanceof _ValidationError) {
        this.logger.error(error)
        throw error
      } // else element not found, so create a new one. It's not a true error!
      return _createElementInstance('action', this.actions, actionData.typeId, actionData.data, actionData.instanceId)
    })
    .then((action) => {
      return _setElementInstance(this.dataHandler, 'action', this.actions, action)
    })
  }
  setActionInstance (action) {
    return _setElementInstance(this.dataHandler, 'action', this.actions, action)
  }
  deleteActionInstance (action) {
    return _deleteElementInstance(this.dataHandler, action.instanceId)
  }
  executeActionData (actionData, executionId = undefined) {
    if (!executionId) {
      executionId = uuid.v4()
    }
    return _createElementInstance('action', this.actions, actionData.typeId, actionData.data, actionData.instanceId)
    .then((action) => {
      const promise = action.execute(executionId)
      this.actionExecutions[executionId] = action
      return promise
      .then(() => {
        delete this.actionExecutions[executionId]
      })
      .catch((error) => {
        this.logger.error(error)
        delete this.actionExecutions[executionId]
      })
    })
    .catch((error) => {
      this.logger.error(error)
      throw error
    })
  }
  abortActionData (actionData, executionId) {
    const action = this.actionExecutions[executionId]
    if (!action) {
      return Promise.reject(new Error('Action execution already stopped.'))
    }

    return action.abort(executionId)
    .then(() => {
      delete this.actionExecutions[executionId]
    })
    .catch((error) => {
      this.logger.error(error)
      delete this.actionExecutions[executionId]
    })
  }

  // Conditions
  getConditionTypes () {
    return Object.keys(this.conditions)
  }
  getConditionInstances () {
    return this.dataHandler.listItems((i) => i.item.type === 'condition')
    .then((results) => results.map((i) => ({ typeId: i.item.typeId, instanceId: i.keyName, data: i.item.data })))
  }
  getConditionInstance (instanceId) {
    return _getElementInstance(this.dataHandler, 'condition', this.conditions, instanceId)
  }
  createConditionInstance (typeId) {
    return _createElementInstance('condition', this.conditions, typeId)
  }
  setConditionData (conditionData) {
    return _getElementInstance(this.dataHandler, 'condition', this.conditions, conditionData.instanceId)
    .then((condition) => {
      condition.data = conditionData.data
      return condition
    })
    .catch((error) => {
      if (error instanceof _ValidationError) {
        this.logger.error(error)
        throw error
      }
      return _createElementInstance('condition', this.conditions, conditionData.typeId, conditionData.data, conditionData.instanceId)
    })
    .then((condition) => _setElementInstance(this.dataHandler, 'condition', this.conditions, condition))
  }
  setConditionInstance (condition) {
    return _setElementInstance(this.dataHandler, 'condition', this.conditions, condition)
  }
  deleteConditionInstance (condition) {
    return _deleteElementInstance(this.dataHandler, condition.instanceId)
  }
  testConditionInstance (conditionData) {
    return _createElementInstance('condition', this.conditions, conditionData.typeId, conditionData.data, conditionData.instanceId)
    .then((condition) => {
      return condition.test()
    })
    .catch((error) => {
      this.logger.error(error)
      throw error
    })
  }

  // Triggers
  getTriggerTypes () {
    return Object.keys(this.triggers)
  }
  getTriggerInstances () {
    return this.dataHandler.listItems((i) => i.item.type === 'trigger')
    .then((results) => results.map((i) => ({ typeId: i.item.typeId, instanceId: i.keyName, data: i.item.data })))
  }
  getTriggerInstance (instanceId) {
    return _getElementInstance(this.dataHandler, 'trigger', this.triggers, instanceId)
  }
  createTriggerInstance (typeId) {
    return _createElementInstance('trigger', this.triggers, typeId)
  }
  setTriggerData (triggerData) {
    return _getElementInstance(this.dataHandler, 'trigger', this.triggers, triggerData.instanceId)
    .then((trigger) => {
      trigger.data = triggerData.data
      return trigger
    })
    .catch((error) => {
      if (error instanceof _ValidationError) {
        this.logger.error(error)
        throw error
      }
      return _createElementInstance('trigger', this.triggers, triggerData.typeId, triggerData.data, triggerData.instanceId)
    })
    .then((trigger) => _setElementInstance(this.dataHandler, 'trigger', this.triggers, trigger))
  }
  setTriggerInstance (trigger) {
    return _setElementInstance(this.dataHandler, 'trigger', this.triggers, trigger)
  }
  deleteTriggerInstance (trigger) {
    return _deleteElementInstance(this.dataHandler, trigger.instanceId)
  }

  // TODO !3: same for scenarii?
}