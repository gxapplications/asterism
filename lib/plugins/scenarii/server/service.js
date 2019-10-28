'use strict'

import { Scenarii } from 'asterism-plugin-library'
import felicity from 'felicity'
import Joi from 'joi'
import uuid from 'uuid'

import baseElements from '../base-elements/server'

const { ServerAction, ServerState, ServerCondition, ServerTrigger, ServerScenario } = Scenarii
const _defaultSchema = Joi.object().keys({ }).unknown(false)
const _schemaSchema = Joi.object().schema()

class _ValidationError extends Error {}

const _getElementInstance = (dataHandler, elementType, typeRepository, instanceId) => {
  if (!instanceId || instanceId === '') {
    return Promise.resolve(null)
  }
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

const _getEnergyPricing = (settings, now) => {
  const prices = settings.prices
  const baseIndex = settings.planningBase[now.getDay()]
  const basePrice = prices[baseIndex]
  const others = settings.planningOthers[now.getDay()]

  const nowMinutes = (now.getHours() * 60) + now.getMinutes()
  const otherPrice = others.reverse().find((o) => o.hour <= nowMinutes)

  return otherPrice ? prices[otherPrice.pricing] : basePrice
}

export { _getEnergyPricing }

export default class ScenariiService {
  constructor ({ getServices, logger, dataHandler, notificationHandler, privateSocket, publicSockets }) {
    this.logger = logger
    this.dataHandler = dataHandler
    this.privateSocket = privateSocket
    this.actions = {}
    this.states = {}
    this.conditions = {}
    this.triggers = {}
    this.scenarii = {}

    this.actionExecutions = {}
    this.stateInstances = []
    this.scenarioInstances = []
    this.scenarioExecutions = {}
    this.triggerInstances = []

    // Register base elements
    baseElements({ logger, scenariiService: this, dataHandler }).forEach(({ id, serverClass, dataSchema }) => {
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

    // Fetch all triggers from DB, link them to activate listeners system
    this.getTriggerInstances().then((instances) => {
      return Promise.all(instances.map(({ typeId, instanceId }) => {
        return _getElementInstance(this.dataHandler, 'trigger', this.triggers, instanceId)
        .then((instance) => {
          this.logger.info(`Mounted trigger ${instance.data.name} of type ${typeId} into memory.`)
          instance.addListener(this._triggerListener(instance))
          return instance
        })
        .catch((error) => {
          this.logger.warn(error.message)
          return null
        })
      }))
    })
    .then((triggerInstances) => {
      this.triggerInstances = triggerInstances.filter((i) => !!i)

      // Fetch all scenarii from DB, link them to activate listeners system
      return this.getScenarioInstances().then((instances) => {
        return Promise.all(instances.map(({ typeId, instanceId }) => {
          return _getElementInstance(this.dataHandler, 'scenario', this.scenarii, instanceId)
          .then((instance) => {
            this.logger.info(`Mounted scenario ${instance.data.name} of type ${typeId} into memory.`)
            instance.addListener(this._scenarioListener(instance))
            instance.afterUpdate()
            return instance
          })
        }))
      })
      .then((scenarioInstances) => {
        this.scenarioInstances = scenarioInstances
      })
    })

    this.allTheCities = false // lazy: required at first getCities() API call
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
          this.logger.log(`Registered ${ServerClass.name} element type as a ServerAction.`)
          break
        case ServerState.name:
          this.states[id] = { ServerClass, dataSchema }
          this.logger.log(`Registered ${ServerClass.name} element type as a ServerState.`)
          break
        case ServerCondition.name:
          this.conditions[id] = { ServerClass, dataSchema }
          this.logger.log(`Registered ${ServerClass.name} element type as a ServerCondition.`)
          break
        case ServerTrigger.name:
          this.triggers[id] = { ServerClass, dataSchema }
          this.logger.log(`Registered ${ServerClass.name} element type as a ServerTrigger.`)
          break
        case ServerScenario.name:
          this.scenarii[id] = { ServerClass, dataSchema }
          this.logger.log(`Registered ${ServerClass.name} element type as a ServerScenario.`)
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
      this.logger.error(`The dataSchema for ${id} you are trying to register server side is incorrect`, error)
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
      this.logger.info(`Executing action ${action.data.name || action.instanceId} with execution #${executionId}.`)
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
    if (!executionId) {
      const actionId = actionData.instanceId
      const actionExecutions = Object.entries(this.actionExecutions).filter(([executionId, action]) => action.instanceId === actionId)

      return Promise.all(actionExecutions.map(([executionId, action]) => this.abortAction(action, executionId)))
      .then(results => results.reduce((acc, res) => acc & res, true))
    }

    const action = this.actionExecutions[executionId]
    if (!action) {
      return Promise.reject(new Error('Action execution already stopped.'))
    }

    return this.abortAction(action, executionId)
  }
  abortAction (action, executionId) {
    this.logger.info(`Aborting action ${action.data.name || action.instanceId} with execution #${executionId}.`)
    return action.abort(executionId)
    .then((result) => {
      delete this.actionExecutions[executionId]
      return result
    })
    .catch((error) => {
      this.logger.error(error)
      delete this.actionExecutions[executionId]
      return false
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
    if (!instanceToDelete) { // In broken type case (plugin removed)
      return _deleteElementInstance(this.logger, this.dataHandler, state.instanceId)
    }
    delete instanceToDelete.listeners // avoid listeners to be called after deletion
    this.stateInstances = this.stateInstances.filter((i) => i.instanceId !== state.instanceId)
    return _deleteElementInstance(this.logger, this.dataHandler, state.instanceId)
  }
  setStateState (stateData, newStateValue) {
    return _getElementInstance(this.dataHandler, 'state', this.states, stateData.instanceId)
    .then((state) => {
      state.state = newStateValue // to trigger state listener broadcasting
      return state
    })
    .then((state) => {
      const instanceToUpdate = this.stateInstances.find((i) => i.instanceId === state.instanceId)
      instanceToUpdate.state = newStateValue // to trigger state listener broadcasting
      return instanceToUpdate
      // no need to set it in DB here : the triggered listener will make it! (else can be added twice...)
      // return _setElementInstance(this.logger, this.dataHandler, 'state', this.states, state)
    })
  }

  _stateListener (instance) {
    return () => {
      this.logger.info(`State ${instance.data.name} value changed to ${instance.data.state}`)
      const { data, instanceId, state } = instance // emit only a part of the object to avoid max call stack exception
      this.privateSocket.emit('stateChanged', { data, instanceId, state })
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
    // Since trigger instances are retrieved at service startup, we use this.triggerInstances instead
    // return _getElementInstance(this.dataHandler, 'trigger', this.triggers, instanceId)

    const instance = this.triggerInstances.find((i) => i.instanceId === instanceId)
    if (!instance) {
      return Promise.reject(new Error(`The trigger #${instanceId} is unknown.`))
    }
    return Promise.resolve(instance)
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
      } // else element not found, so create a new one. It's not a true error!
      return _createElementInstance(this.logger, 'trigger', this.triggers, triggerData.typeId, triggerData.data, triggerData.instanceId)
      .then((instance) => {
        this.logger.log(`Mounted trigger ${instance.data.name} of type ${triggerData.typeId} into memory.`)
        instance.addListener(this._triggerListener(instance))
        this.triggerInstances.push(instance)
        return instance
      })
    })
    .then((trigger) => {
      const instanceToUpdate = this.triggerInstances.find((i) => i.instanceId === trigger.instanceId)
      instanceToUpdate.data = triggerData.data
      return _setElementInstance(this.logger, this.dataHandler, 'trigger', this.triggers, trigger)
      .then((succeed) => {
        if (succeed) {
          this.logger.log(`Rescheduling trigger ${instanceToUpdate.data.name} of type ${triggerData.typeId}.`)
          return instanceToUpdate.reschedule()
        }
        return succeed
      })
    })
  }
  setTriggerInstance (trigger) {
    return _setElementInstance(this.logger, this.dataHandler, 'trigger', this.triggers, trigger)
    .then((succeed) => {
      if (succeed) {
        this.logger.log(`Scheduling trigger ${trigger.data.name} of type ${trigger.typeId}.`)
        return trigger.reschedule()
      }
      return succeed
    })
  }
  deleteTriggerInstance (trigger) {
    const instanceToDelete = this.triggerInstances.find((i) => i.instanceId === trigger.instanceId)
    if (!instanceToDelete) { // In broken type case (plugin removed)
      return _deleteElementInstance(this.logger, this.dataHandler, trigger.instanceId)
    }
    delete instanceToDelete.listeners // avoid listeners to be called after deletion
    this.triggerInstances = this.triggerInstances.filter((i) => i.instanceId !== trigger.instanceId)
    return _deleteElementInstance(this.logger, this.dataHandler, trigger.instanceId)
  }
  rescheduleAllTriggers () {
    return Promise.all(this.triggerInstances.map(trigger => trigger.reschedule()))
  }

  _triggerListener (instance) {
    const listener = () => {
      this.logger.info(`Trigger ${instance.data.name} has just been triggered`)
      const { data, instanceId } = instance // emit only a part of the object to avoid max call stack exception
      this.privateSocket.emit('triggerTriggered', { data, instanceId })
    }
    listener.lazy = true // A lazy listener will not been called by a trigger if there is no other 'no lazy triggers' registered in the trigger.
    return listener
  }

  // Scenarii
  getScenarioTypes () {
    return Object.keys(this.scenarii)
  }
  getScenarioInstances () {
    return this.dataHandler.listItems((i) => i.item.type === 'scenario')
    .then((results) => results.map((i) => ({ typeId: i.item.typeId, instanceId: i.keyName, data: i.item.data })))
  }
  getScenarioInstance (instanceId) {
    // Since scenarii instances are retrieved at service startup, we use this.scenarioInstances instead
    // return _getElementInstance(this.dataHandler, 'scenario', this.scenarii, instanceId)

    const instance = this.scenarioInstances.find((i) => i.instanceId === instanceId)
    if (!instance) {
      return Promise.reject(new Error(`The scenario #${instanceId} is unknown.`))
    }
    return Promise.resolve(instance)
  }
  createScenarioInstance (typeId) {
    return _createElementInstance(this.logger, 'scenario', this.scenarii, typeId)
    .then((instance) => {
      if (instance.data.activated === undefined) {
        instance.data.activated = true
      }
      return instance
    })
  }
  setScenarioData (scenarioData) {
    return _getElementInstance(this.dataHandler, 'scenario', this.scenarii, scenarioData.instanceId)
    .then((scenario) => {
      scenario.data = scenarioData.data
      scenario.activated = scenario.data.activated // to trigger scenario listener broadcasting
      return scenario
    })
    .catch((error) => {
      if (error instanceof _ValidationError) {
        this.logger.error(error)
        throw error
      } // else element not found, so create a new one. It's not a true error!
      return _createElementInstance(this.logger, 'scenario', this.scenarii, scenarioData.typeId, scenarioData.data, scenarioData.instanceId)
      .then((instance) => {
        this.logger.log(`Mounted scenarii ${instance.data.name} of type ${scenarioData.typeId} into memory.`)
        instance.addListener(this._scenarioListener(instance))
        this.scenarioInstances.push(instance)
        return instance
      })
    })
    .then((scenario) => {
      const instanceToUpdate = this.scenarioInstances.find((i) => i.instanceId === scenario.instanceId)
      instanceToUpdate.data = scenarioData.data
      instanceToUpdate.activated = scenarioData.data.activated // to trigger scenario listener broadcasting
      return instanceToUpdate
      // no need to set it in DB here : the triggered listener will make it! (else can be added twice...)
      // return _setElementInstance(this.logger, this.dataHandler, 'scenario', this.scenarii, scenario)
    })
  }
  setScenarioInstance (scenario) {
    return _setElementInstance(this.logger, this.dataHandler, 'scenario', this.scenarii, scenario)
    .then((succeed) => {
      if (succeed) {
        return scenario.afterUpdate()
      }
      return succeed
    })
  }
  deleteScenarioInstance (scenario) {
    const instanceToDelete = this.scenarioInstances.find((i) => i.instanceId === scenario.instanceId)
    if (!instanceToDelete) { // In broken type case (plugin removed)
      return _deleteElementInstance(this.logger, this.dataHandler, scenario.instanceId)
    }
    delete instanceToDelete.listeners // avoid listeners to be called after deletion
    this.scenarioInstances = this.scenarioInstances.filter((i) => i.instanceId !== scenario.instanceId)
    return _deleteElementInstance(this.logger, this.dataHandler, scenario.instanceId)
  }
  forceTriggerScenarioInstance (scenarioData, executionId = undefined) {
    if (!executionId) {
      executionId = uuid.v4()
    }

    const scenario = this.scenarioInstances.find((scenarioInstance) => scenarioInstance.instanceId === scenarioData.instanceId)
    this.logger.info(`Force triggering scenario ${scenario.data.name || scenario.instanceId} with execution #${executionId}.`)
    return scenario.trigger(executionId)
  }
  forceAbortScenarioInstance (scenarioData, executionId) {
    if (!executionId) {
      const scenarioId = scenarioData.instanceId
      const scenarioExecutions = Object.entries(this.scenarioExecutions).filter(([executionId, scenario]) => scenario.instanceId === scenarioId)

      return Promise.all(scenarioExecutions.map(([executionId, scenario]) => this.abortScenario(scenario, executionId)))
      .then(results => results.reduce((acc, res) => acc & res, true))
    }

    const scenario = this.scenarioExecutions[executionId]
    if (!scenario) {
      return Promise.reject(new Error('Scenario execution already stopped.'))
    }

    return this.abortScenario(scenario, executionId)
  }
  abortScenario (scenario, executionId) {
    this.logger.info(`Aborting scenario ${scenario.data.name || scenario.instanceId} with execution #${executionId}.`)
    return scenario.abort(executionId)
    .then((result) => {
      delete this.scenarioExecutions[executionId]
      return result
    })
    .catch((error) => {
      this.logger.error(error)
      delete this.scenarioExecutions[executionId]
      return false
    })
  }
  setActivationScenarioInstance (scenarioData, activate) {
    const instanceToUpdate = this.scenarioInstances.find((i) => i.instanceId === scenarioData.instanceId)
    instanceToUpdate.activated = activate // to trigger scenario listener broadcasting
    return instanceToUpdate // _scenarioListener() will be called and then scenario will be saved.
  }

  _scenarioListener (instance) {
    return (event, value) => {
      this.logger.info(`Scenario ${(instance.data && instance.data.name) || instance.instanceId}: ${event}`)
      switch (event) {
        case 'triggered':
          value
          .then(() => {
            delete this.scenarioExecutions[value.executionId]
          })
          .catch((error) => {
            this.logger.error(error)
            delete this.scenarioExecutions[value.executionId]
          })
          this.scenarioExecutions[value.executionId] = instance
          break
        case 'aborted':
          value
          .then(() => {
            delete this.scenarioExecutions[value.executionId]
          })
          .catch((error) => {
            this.logger.error(error)
            delete this.scenarioExecutions[value.executionId]
          })
          break
        case 'activationChanged':
          this.logger.info(`Scenario ${instance.data.name} activation changed to ${value}`)
          const { data, instanceId, activated } = instance // emit only a part of the object to avoid max call stack exception
          this.privateSocket.emit('scenarioActivationChanged', { data, instanceId, activated })
          this.setScenarioInstance(instance)
          .catch((error) => {
            console.error(error, instance)
            this.logger.error(`Scenario ${instance.data.name} activation change cannot be persisted!`)
          })
          break
        default:
      }
    }
  }

  // Others

  getCities (pattern) {
    return new Promise((resolve, reject) => {
      if (!this.allTheCities) {
        this.allTheCities = require('all-the-cities')
      }

      const cities = this.allTheCities
      .filter(city => {
        return (city.population >= 8000) && city.name.match(new RegExp(pattern, 'iu'))
      })
      .sort((a, b) => b.population - a.population)
      .slice(0, 32)

      resolve(cities)
    })
  }

  getEnergyPricing () {
    return this.dataHandler.getItem('settings-domotics-energy-costs')
    .then(settings => _getEnergyPricing(settings, new Date()))
  }
}
