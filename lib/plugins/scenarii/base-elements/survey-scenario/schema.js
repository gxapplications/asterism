'use strict'

import Joi from 'joi'

const elementId = Joi.string().guid().allow('').default('')
const raisingTrigger = Joi.object().keys({
  name: Joi.string().required().default('Unnamed trigger'),
  triggerId: elementId.required(),
  warningDelay: Joi.number().integer().min(0).max(60).required().default(10) // in seconds, delay before warning level turns into alarming level
})
const armingConditionToNotice = Joi.object().keys({
  name: Joi.string().required().default('Unnamed arming condition to notice'),
  conditionId: elementId.required()
})

const schema = Joi.object().keys({
  name: Joi.string().required().default('Unconfigured survey scenario'),
  levelStateId: Joi.string().guid().allow('').required().default(''), // state with 2 or 3 levels (ok, [warning], alarm)
  armingDelay: Joi.number().integer().min(0).max(10 * 60).required().default(20), // in seconds
  activated: Joi.boolean().required().default(false), // false: disarmed or arming ; true: armed

  armingConditionsToNotice: Joi.array().min(0).max(32).required().items(armingConditionToNotice).default([]), // when arming, test then, if one is true, notice that before continue
  raisingTriggers: Joi.array().min(0).max(128).required().items(raisingTrigger).default([]),
  deactivationTriggerIds: Joi.array().min(0).max(16).required().items(elementId).default([]),

  armingActions: Joi.array().min(0).max(16).required().items(elementId).default([]),
  warningActions: Joi.array().min(0).max(16).required().items(elementId).default([]),
  alarmingActions: Joi.array().min(0).max(16).required().items(elementId).default([]),
  deactivationActions: Joi.array().min(0).max(16).required().items(elementId).default([])

  // TODO !5: more attributes?
})

export default schema
