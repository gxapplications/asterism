'use strict'

import { Scenarii } from 'asterism-plugin-library'
import Joi from 'joi'
import uuid from 'uuid'

import baseElements from '../base-elements/browser'

const { BrowserAction, BrowserState, BrowserCondition, BrowserTrigger } = Scenarii
const _defaultSchema = Joi.object().keys({ }).unknown(false)
const _schemaSchema = Joi.object().schema()

export default class ScenariiService {
  constructor ({ getServices, notificationManager, mainState, privateSocket, publicSockets }) {
    this.privateSocket = privateSocket
    this.actions = {}
    this.states = {}
    this.conditions = {}
    this.triggers = {}

    // Register base elements
    baseElements().forEach(({ id, browserClass, dataSchema }) => {
      this.registerElementType(id, browserClass, dataSchema)
    })
  }

  registerElementType (id, BrowserClass, dataSchema = _defaultSchema, TestClass = null) {
    if (!dataSchema.isJoi) {
      dataSchema = Joi.compile(dataSchema)
    }
    return Joi.validate(dataSchema, _schemaSchema)
    .then(() => {
      TestClass = TestClass || BrowserClass
      switch (Object.getPrototypeOf(TestClass) && Object.getPrototypeOf(TestClass).name) {
        case BrowserAction.name:
          this.actions[id] = { BrowserClass, dataSchema }
          break
        case BrowserState.name:
          this.states[id] = { BrowserClass, dataSchema }
          break
        case BrowserCondition.name:
          this.conditions[id] = { BrowserClass, dataSchema }
          break
        case BrowserTrigger.name:
          this.triggers[id] = { BrowserClass, dataSchema }
          break
        default:
          if (!Object.getPrototypeOf(TestClass)) {
            console.error(`You are trying to register a scenarii element '${BrowserClass.name}' that do not extends a base element!`)
          } else {
            return this.registerElementType(id, BrowserClass, dataSchema, Object.getPrototypeOf(TestClass))
          }
      }
    })
    .catch((error) => {
      console.error('The dataSchema you are trying to register is incorrect', error)
    })
  }

  // Actions
  getActionTypes () {
    return new Promise((resolve, reject) => {
      this.privateSocket.emit('getActionTypes', (types) => {
        resolve(types.map((type) => {
          const { BrowserClass } = this.actions[type]
          if (!BrowserClass.id) {
            BrowserClass.id = type
            Object.freeze(BrowserClass)
          }
          return BrowserClass
        }))
      })
      setTimeout(reject, 700)
    })
  }
  getActionInstances () {
    return new Promise((resolve, reject) => {
      this.privateSocket.emit('getActionInstances', (instances) => {
        resolve(instances.map(({ typeId, instanceId, data }) => {
          if (!this.actions[typeId]) {
            console.warn('Action instance of unknown type found. Maybe you removed a plugin.')
            return null
          }
          const { BrowserClass } = this.actions[typeId]
          const instance = new BrowserClass(data)
          instance.instanceId = instanceId
          instance.typeId = typeId
          instance.save = this.setActionInstance.bind(this, instance)
          instance.delete = this.deleteActionInstance.bind(this, instance)
          return instance
        }))
      })
      setTimeout(reject, 2000)
    })
  }
  getActionInstance (instanceId) {
    return new Promise((resolve, reject) => {
      this.privateSocket.emit('getActionInstance', instanceId, (instance) => {
        resolve(instance)
      })
      setTimeout(reject, 700)
    })
  }
  createActionInstance (typeId) {
    return new Promise((resolve, reject) => {
      this.privateSocket.emit('createActionInstance', typeId, (instanceData) => {
        const { BrowserClass } = this.actions[instanceData.typeId]
        const instance = new BrowserClass(instanceData.data)
        instance.instanceId = instanceData.instanceId
        instance.typeId = typeId
        instance.save = this.setActionInstance.bind(this, instance)
        instance.delete = this.deleteActionInstance.bind(this, instance)
        resolve(instance)
      })
      setTimeout(reject, 700)
    })
  }
  setActionInstance (instance) {
    const { dataSchema } = this.actions[instance.typeId]
    return Joi.validate(instance.data, dataSchema)
    .then((fixedData) => {
      instance.data = fixedData
      return new Promise((resolve, reject) => {
        this.privateSocket.emit('setActionInstance', instance, (success) => {
          if (success) {
            return resolve(instance)
          }
          reject(success)
        })
        setTimeout(reject, 2000)
      })
    })
  }
  deleteActionInstance (instance) {
    return new Promise((resolve, reject) => {
      this.privateSocket.emit('deleteActionInstance', instance, (success) => {
        if (success) {
          return resolve(instance)
        }
        reject(success)
      })
      setTimeout(reject, 2000)
    })
  }
  executeActionInstance (instance, timeout = 10000, executionId = null) {
    if (!executionId) {
      executionId = uuid.v4()
    }
    return new Promise((resolve, reject) => {
      this.privateSocket.emit('executeActionInstance', instance, executionId, (success) => {
        return resolve(success)
      })
      setTimeout(reject, timeout) // After timeout, action execution is cancelled on the UI (but will continue on the server)
    })
  }
  abortActionInstance (instance, executionId, timeout = 10000) {
    return new Promise((resolve, reject) => {
      this.privateSocket.emit('abortActionInstance', instance, executionId, (success) => {
        return resolve(success)
      })
      setTimeout(reject, timeout) // After timeout, action abortion is cancelled on the UI (but will try to continue on the server)
    })
  }

  // States
  getStateTypes () {
    return new Promise((resolve, reject) => {
      this.privateSocket.emit('getStateTypes', (types) => {
        resolve(types.map((type) => {
          const { BrowserClass } = this.states[type]
          if (!BrowserClass.id) {
            BrowserClass.id = type
            Object.freeze(BrowserClass)
          }
          return BrowserClass
        }))
      })
      setTimeout(reject, 700)
    })
  }
  getStateInstances () {
    return new Promise((resolve, reject) => {
      this.privateSocket.emit('getStateInstances', (instances) => {
        resolve(instances.map(({ typeId, instanceId, data }) => {
          if (!this.states[typeId]) {
            console.warn('State instance of unknown type found. Maybe you removed a plugin.')
            return null
          }
          const { BrowserClass } = this.states[typeId]
          const instance = new BrowserClass(data)
          instance.instanceId = instanceId
          instance.typeId = typeId
          instance.save = this.setStateInstance.bind(this, instance)
          instance.delete = this.deleteStateInstance.bind(this, instance)
          return instance
        }))
      })
      setTimeout(reject, 2000)
    })
  }
  getStateInstance (instanceId) {
    return new Promise((resolve, reject) => {
      this.privateSocket.emit('getStateInstance', instanceId, (instance) => {
        resolve(instance)
      })
      setTimeout(reject, 700)
    })
  }
  createStateInstance (typeId) {
    return new Promise((resolve, reject) => {
      this.privateSocket.emit('createStateInstance', typeId, (instanceData) => {
        const { BrowserClass } = this.states[instanceData.typeId]
        const instance = new BrowserClass(instanceData.data)
        instance.instanceId = instanceData.instanceId
        instance.typeId = typeId
        instance.save = this.setStateInstance.bind(this, instance)
        instance.delete = this.deleteStateInstance.bind(this, instance)
        resolve(instance)
      })
      setTimeout(reject, 700)
    })
  }
  setStateInstance (instance) {
    const { dataSchema } = this.states[instance.typeId]
    return Joi.validate(instance.data, dataSchema)
    .then((fixedData) => {
      instance.data = fixedData
      return new Promise((resolve, reject) => {
        this.privateSocket.emit('setStateInstance', instance, (success) => {
          if (success) {
            return resolve(instance)
          }
          reject(success)
        })
        setTimeout(reject, 2000)
      })
    })
  }
  deleteStateInstance (instance) {
    return new Promise((resolve, reject) => {
      this.privateSocket.emit('deleteStateInstance', instance, (success) => {
        if (success) {
          return resolve(instance)
        }
        reject(success)
      })
      setTimeout(reject, 2000)
    })
  }

  // Conditions
  getConditionTypes () {
    return new Promise((resolve, reject) => {
      this.privateSocket.emit('getConditionTypes', (types) => {
        resolve(types.map((type) => {
          const { BrowserClass } = this.conditions[type]
          if (!BrowserClass.id) {
            BrowserClass.id = type
            Object.freeze(BrowserClass)
          }
          return BrowserClass
        }))
      })
      setTimeout(reject, 700)
    })
  }
  getConditionInstances () {
    return new Promise((resolve, reject) => {
      this.privateSocket.emit('getConditionInstances', (instances) => {
        resolve(instances.map(({ typeId, instanceId, data }) => {
          if (!this.conditions[typeId]) {
            console.warn('Condition instance of unknown type found. Maybe you removed a plugin.')
            return null
          }
          const { BrowserClass } = this.conditions[typeId]
          const instance = new BrowserClass(data)
          instance.instanceId = instanceId
          instance.typeId = typeId
          instance.save = this.setConditionInstance.bind(this, instance)
          instance.delete = this.deleteConditionInstance.bind(this, instance)
          return instance
        }))
      })
      setTimeout(reject, 2000)
    })
  }
  getConditionInstance (instanceId) {
    return new Promise((resolve, reject) => {
      this.privateSocket.emit('getConditionInstance', instanceId, (instance) => {
        resolve(instance)
      })
      setTimeout(reject, 700)
    })
  }
  createConditionInstance (typeId) {
    return new Promise((resolve, reject) => {
      this.privateSocket.emit('createConditionInstance', typeId, (instanceData) => {
        const { BrowserClass } = this.conditions[instanceData.typeId]
        const instance = new BrowserClass(instanceData.data)
        instance.instanceId = instanceData.instanceId
        instance.typeId = typeId
        instance.save = this.setConditionInstance.bind(this, instance)
        instance.delete = this.deleteConditionInstance.bind(this, instance)
        resolve(instance)
      })
      setTimeout(reject, 700)
    })
  }
  setConditionInstance (instance) {
    const { dataSchema } = this.actions[instance.typeId]
    return Joi.validate(instance.data, dataSchema)
    .then((fixedData) => {
      instance.data = fixedData
      return new Promise((resolve, reject) => {
        this.privateSocket.emit('setConditionInstance', instance, (success) => {
          if (success) {
            return resolve(instance)
          }
          reject(success)
        })
        setTimeout(reject, 2000)
      })
    })
  }
  deleteConditionInstance (instance) {
    return new Promise((resolve, reject) => {
      this.privateSocket.emit('deleteConditionInstance', instance, (success) => {
        if (success) {
          return resolve(instance)
        }
        reject(success)
      })
      setTimeout(reject, 2000)
    })
  }
  testConditionInstance (instance, timeout = 10000) {
    return new Promise((resolve, reject) => {
      this.privateSocket.emit('testConditionInstance', instance, (success) => {
        return resolve(success)
      })
      setTimeout(reject, timeout) // After timeout, condition execution is cancelled on the UI (but will continue on the server)
    })
  }

  // Triggers
  getTriggerTypes () {
    return new Promise((resolve, reject) => {
      this.privateSocket.emit('getTriggerTypes', (types) => {
        resolve(types.map((type) => {
          const { BrowserClass } = this.triggers[type]
          if (!BrowserClass.id) {
            BrowserClass.id = type
            Object.freeze(BrowserClass)
          }
          return BrowserClass
        }))
      })
      setTimeout(reject, 700)
    })
  }
  getTriggerInstances () {
    return new Promise((resolve, reject) => {
      this.privateSocket.emit('getTriggerInstances', (instances) => {
        resolve(instances.map(({ typeId, instanceId, data }) => {
          if (!this.triggers[typeId]) {
            console.warn('Trigger instance of unknown type found. Maybe you removed a plugin.')
            return null
          }
          const { BrowserClass } = this.triggers[typeId]
          const instance = new BrowserClass(data)
          instance.instanceId = instanceId
          instance.typeId = typeId
          instance.save = this.setTriggerInstance.bind(this, instance)
          instance.delete = this.deleteTriggerInstance.bind(this, instance)
          return instance
        }))
      })
      setTimeout(reject, 2000)
    })
  }
  getTriggerInstance (instanceId) {
    return new Promise((resolve, reject) => {
      this.privateSocket.emit('getTriggerInstance', instanceId, (instance) => {
        resolve(instance)
      })
      setTimeout(reject, 700)
    })
  }
  createTriggerInstance (typeId) {
    return new Promise((resolve, reject) => {
      this.privateSocket.emit('createTriggerInstance', typeId, (instanceData) => {
        const { BrowserClass } = this.triggers[instanceData.typeId]
        const instance = new BrowserClass(instanceData.data)
        instance.instanceId = instanceData.instanceId
        instance.typeId = typeId
        instance.save = this.setTriggerInstance.bind(this, instance)
        instance.delete = this.deleteTriggerInstance.bind(this, instance)
        resolve(instance)
      })
      setTimeout(reject, 700)
    })
  }
  setTriggerInstance (instance) {
    const { dataSchema } = this.actions[instance.typeId]
    return Joi.validate(instance.data, dataSchema)
    .then((fixedData) => {
      instance.data = fixedData
      return new Promise((resolve, reject) => {
        this.privateSocket.emit('setTriggerInstance', instance, (success) => {
          if (success) {
            return resolve(instance)
          }
          reject(success)
        })
        setTimeout(reject, 2000)
      })
    })
  }
  deleteTriggerInstance (instance) {
    return new Promise((resolve, reject) => {
      this.privateSocket.emit('deleteTriggerInstance', instance, (success) => {
        if (success) {
          return resolve(instance)
        }
        reject(success)
      })
      setTimeout(reject, 2000)
    })
  }

  // TODO !3: same for scenarii?
}
