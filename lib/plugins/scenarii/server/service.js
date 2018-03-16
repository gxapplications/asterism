'use strict'

import { Scenarii } from 'asterism-plugin-library'
import felicity from 'felicity'
import Joi from 'joi'
import uuid from 'uuid'

import baseElements from '../base-elements/server'

const { ServerAction, ServerState, ServerCondition, ServerTrigger } = Scenarii
const _defaultSchema = Joi.object().keys({ }).unknown(false)
const _schemaSchema = Joi.object().schema()

class _ValidationError extends Error {}

const _getElementInstance = (dataHandler, elementType, typeRepository, instanceId) => {
  return dataHandler.getItem(instanceId)
  .then((instance) => {
    if (!instance) {
      return null
    }

    const { typeId, type, data, parent } = instance
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
      instance.parent = parent
      return instance
    })
  })
}

const _createElementInstance = (logger, elementType, typeRepository, typeId, defaultData, defaultId) => {
  if (!typeRepository[typeId]) {
    return Promise.reject(new Error(`The ${elementType} type ${typeId} is unknown. Cannot create a new instance.`))
    .catch((error) => {
      logger.error(error)
      throw error
    })
  }

  const { ServerClass, dataSchema } = typeRepository[typeId]
  const instanceId = defaultId || uuid.v4()
  defaultData = defaultData || felicity.example(dataSchema, { config: { ignoreValids: true, ignoreDefaults: false } })

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
    logger.error(error, defaultData)
    throw error
  })
}

const _setElementInstance = (logger, dataHandler, elementType, typeRepository, element, parent = undefined) => {
  const Clazz = element.constructor
  const type = Object.entries(typeRepository).find((entry) => entry[1].ServerClass === Clazz)
  if (!type) {
    return Promise.reject(new Error(`The ${elementType} type is unknown. Cannot persist this object.`))
    .catch((error) => {
      logger.error(error)
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
      data: fixedData,
      parent: parent
    }
    return dataHandler.setItem(element.instanceId, objectToPersist) // resolves with true when succeed
  })
  .catch((error) => {
    logger.error(error)
    throw error
  })
}

const _deleteElementInstance = (logger, dataHandler, instanceId) => {
  return dataHandler.removeItem(instanceId) // resolves with true when succeed
  .catch((error) => {
    logger.error(error)
    throw error
  })
}

export default class ScenariiService {
  constructor ({ getServices, logger, dataHandler, notificationHandler, privateSocket, publicSockets }) {
    this.logger = logger
    this.dataHandler = dataHandler
    this.privateSocket = privateSocket
    this.actions = {}
    this.states = {}
    this.conditions = {}
    this.triggers = {}

    this.actionExecutions = {}
    this.stateInstances = []

    // Register base elements
    baseElements({ logger, scenariiService: this }).forEach(({ id, serverClass, dataSchema }) => {
      this.registerElementType(id, serverClass, dataSchema)
    })

    // Fetch all states from DB, link them to activate listeners system
    this.getStateInstances().then((instances) => {
      return Promise.all(instances.map(({ typeId, instanceId }) => {
        return _getElementInstance(this.dataHandler, 'state', this.states, instanceId)
        .then((instance) => {
          this.logger.info(`Mounted state ${instance.data.name} of type ${typeId} into memory. Current value: ${instance.data.state}`)
          instance.addListener(this._stateListener(instance))
          return instance
        })
      }))
    })
    .then((stateInstances) => {
      this.stateInstances = stateInstances
    })
  }

  registerElementType (id, ServerClass, dataSchema = _defaultSchema, TestClass = null) {
    if (!dataSchema.isJoi) {
      dataSchema = Joi.compile(dataSchema)
    }
    return Joi.validate(dataSchema, _schemaSchema)
    .then(() => {
      TestClass = TestClass || ServerClass
      switch (Object.getPrototypeOf(TestClass) && Object.getPrototypeOf(TestClass).name) {
        case ServerAction.name:
          this.actions[id] = { ServerClass, dataSchema }
          this.logger.log(`Registered ${ServerClass.name} element type as a BrowserAction.`)
          break
        case ServerState.name:
          this.states[id] = { ServerClass, dataSchema }
          this.logger.log(`Registered ${ServerClass.name} element type as a BrowserState.`)
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
  getActionInstances (parent = undefined) {
    return this.dataHandler.listItems((i) => i.item.type === 'action' && i.item.parent == parent) // eslint-disable-line eqeqeq
    .then((results) => results.map((i) => ({ typeId: i.item.typeId, instanceId: i.keyName, data: i.item.data, parent: i.item.parent })))
  }
  getActionInstance (instanceId) {
    return _getElementInstance(this.dataHandler, 'action', this.actions, instanceId)
  }
  createActionInstance (typeId) {
    return _createElementInstance(this.logger, 'action', this.actions, typeId)
  }
  setActionData (actionData, parent) {
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
      return _createElementInstance(this.logger, 'action', this.actions, actionData.typeId, actionData.data, actionData.instanceId)
    })
    .then((action) => {
      return _setElementInstance(this.logger, this.dataHandler, 'action', this.actions, action, parent)
    })
  }
  setActionInstance (action) {
    return _setElementInstance(this.logger, this.dataHandler, 'action', this.actions, action)
  }
  deleteActionInstance (action) {
    return _deleteElementInstance(this.logger, this.dataHandler, action.instanceId)
  }
  executeActionData (actionData, executionId = undefined) {
    if (!executionId) {
      executionId = uuid.v4()
    }
    return _createElementInstance(this.logger, 'action', this.actions, actionData.typeId, actionData.data, actionData.instanceId)
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

  // States
  getStateTypes () {
    return Object.keys(this.states)
  }
  getStateInstances () {
    return this.dataHandler.listItems((i) => i.item.type === 'state')
    .then((results) => results.map((i) => ({ typeId: i.item.typeId, instanceId: i.keyName, data: i.item.data })))
  }
  getStateInstance (instanceId) {
    // Since state instances are retrieved at service startup, we use this.stateInstances instead
    // return _getElementInstance(this.dataHandler, 'state', this.states, instanceId)

    const instance = this.stateInstances.find((i) => i.instanceId === instanceId)
    if (!instance) {
      return Promise.reject(new Error(`The state #${instanceId} is unknown.`))
    }
    return Promise.resolve(instance)
  }
  createStateInstance (typeId) {
    return _createElementInstance(this.logger, 'state', this.states, typeId)
  }
  setStateData (stateData) {
    return _getElementInstance(this.dataHandler, 'state', this.states, stateData.instanceId)
    .then((state) => {
      state.data = stateData.data
      state.state = stateData.data.state // to trigger state listener broadcasting
      return state
    })
    .catch((error) => {
      if (error instanceof _ValidationError) {
        this.logger.error(error)
        throw error
      } // else element not found, so create a new one. It's not a true error!
      return _createElementInstance(this.logger, 'state', this.states, stateData.typeId, stateData.data, stateData.instanceId)
      .then((instance) => {
        this.logger.log(`Mounted state ${instance.data.name} of type ${stateData.typeId} into memory.`)
        instance.addListener(this._stateListener(instance))
        this.stateInstances.push(instance)
        return instance
      })
    })
    .then((state) => {
      const instanceToUpdate = this.stateInstances.find((i) => i.instanceId === state.instanceId)
      instanceToUpdate.data = stateData.data
      instanceToUpdate.state = stateData.data.state // to trigger state listener broadcasting
      return instanceToUpdate
      // no need to set it in DB here : the triggered listener will make it! (else can be added twice...)
      // return _setElementInstance(this.logger, this.dataHandler, 'state', this.states, state)
    })
  }
  setStateInstance (state) {
    return _setElementInstance(this.logger, this.dataHandler, 'state', this.states, state)
  }
  deleteStateInstance (state) {
    const instanceToDelete = this.stateInstances.find((i) => i.instanceId === state.instanceId)
    delete instanceToDelete.listeners // avoid listeners to be called after deletion
    this.stateInstances = this.stateInstances.filter((i) => i.instanceId !== state.instanceId)
    return _deleteElementInstance(this.logger, this.dataHandler, state.instanceId)
  }

  _stateListener (instance) {
    return () => {
      this.logger.info(`State ${instance.data.name} value changed to ${instance.data.state}`)
      this.privateSocket.emit('stateChanged', instance)
      this.setStateInstance(instance)
      .catch((error) => {
        console.error(error, instance)
        this.logger.error(`State ${instance.data.name} value change cannot be persisted!`)
      })
    }
  }

  // Conditions
  getConditionTypes () {
    return Object.keys(this.conditions)
  }
  getConditionInstances (parent = undefined) {
    return this.dataHandler.listItems((i) => i.item.type === 'condition' && i.item.parent == parent) // eslint-disable-line eqeqeq
    .then((results) => results.map((i) => ({ typeId: i.item.typeId, instanceId: i.keyName, data: i.item.data })))
  }
  getConditionInstance (instanceId) {
    return _getElementInstance(this.dataHandler, 'condition', this.conditions, instanceId)
  }
  createConditionInstance (typeId) {
    return _createElementInstance(this.logger, 'condition', this.conditions, typeId)
  }
  setConditionData (conditionData, parent = undefined) {
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
      return _createElementInstance(this.logger, 'condition', this.conditions, conditionData.typeId, conditionData.data, conditionData.instanceId)
    })
    .then((condition) => _setElementInstance(this.logger, this.dataHandler, 'condition', this.conditions, condition, parent))
  }
  setConditionInstance (condition) {
    return _setElementInstance(this.logger, this.dataHandler, 'condition', this.conditions, condition)
  }
  deleteConditionInstance (condition) {
    return _deleteElementInstance(this.logger, this.dataHandler, condition.instanceId)
  }
  testConditionInstance (conditionData) {
    return _createElementInstance(this.logger, 'condition', this.conditions, conditionData.typeId, conditionData.data, conditionData.instanceId)
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
  getTriggerInstances (parent = undefined) {
    return this.dataHandler.listItems((i) => i.item.type === 'trigger' && i.item.parent == parent) // eslint-disable-line eqeqeq
    .then((results) => results.map((i) => ({ typeId: i.item.typeId, instanceId: i.keyName, data: i.item.data })))
  }
  getTriggerInstance (instanceId) {
    return _getElementInstance(this.dataHandler, 'trigger', this.triggers, instanceId)
  }
  createTriggerInstance (typeId) {
    return _createElementInstance(this.logger, 'trigger', this.triggers, typeId)
  }
  setTriggerData (triggerData, parent = undefined) {
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
      return _createElementInstance(this.logger, 'trigger', this.triggers, triggerData.typeId, triggerData.data, triggerData.instanceId)
    })
    .then((trigger) => _setElementInstance(this.logger, this.dataHandler, 'trigger', this.triggers, trigger, parent))
  }
  setTriggerInstance (trigger) {
    return _setElementInstance(this.logger, this.dataHandler, 'trigger', this.triggers, trigger)
  }
  deleteTriggerInstance (trigger) {
    return _deleteElementInstance(this.logger, this.dataHandler, trigger.instanceId)
  }

  // TODO !2: same for scenarii?
}
