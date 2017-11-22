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

const _getElementInstance = (dataHandler, elementType, typeRepository, instanceId, noFreeze = false) => {
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
      if (!noFreeze) {
        Object.freeze(instance)
      }

      return instance
    })
  })
}

const _createElementInstance = (elementType, typeRepository, typeId, defaultData, defaultId) => {
  if (!typeRepository[typeId]) {
    throw new Error(`The ${elementType} type ${typeId} is unknown. Cannot create a new instance.`)
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
    Object.freeze(instance)
    return instance
  })
}

const _setElementInstance = (dataHandler, elementType, typeRepository, element) => {
  const Clazz = element.constructor
  const type = Object.entries(typeRepository).find((entry) => entry[1].ServerClass === Clazz)
  if (!type) {
    throw new Error(`The ${elementType} type is unknown. Cannot persist this object.`)
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
}

const _deleteElementInstance = (dataHandler, instanceId) => {
  return dataHandler.removeItem(instanceId) // resolves with true when succeed
}

export default class ScenariiService {
  constructor ({ getServices, logger, dataHandler, notificationHandler, privateSocket, publicSockets }) {
    this.logger = logger
    this.dataHandler = dataHandler
    this.actions = {}
    this.conditions = {}
    this.triggers = {}

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
    return _getElementInstance(this.dataHandler, 'action', this.actions, actionData.instanceId, true)
    .then((action) => {
      action.data = actionData.data
      return action
    })
    .catch((error) => {
      if (error instanceof _ValidationError) {
        throw error
      }
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
  testActionData (actionData) {
    return _createElementInstance('action', this.actions, actionData.typeId, actionData.data, actionData.instanceId)
    .then((action) => {
      return action.execute()
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
    return _getElementInstance(this.dataHandler, 'condition', this.conditions, conditionData.instanceId, true)
    .then((condition) => {
      condition.data = conditionData.data
      return condition
    })
    .catch((error) => {
      if (error instanceof _ValidationError) {
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
    return _getElementInstance(this.dataHandler, 'trigger', this.triggers, triggerData.instanceId, true)
    .then((trigger) => {
      trigger.data = triggerData.data
      return trigger
    })
    .catch((error) => {
      if (error instanceof _ValidationError) {
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

  // TODO !2: same for scenarii?
}
