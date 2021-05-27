'use strict'

import Joi from 'joi'

const baseDay = [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1]
const baseProgramWeek = [baseDay, baseDay, baseDay, baseDay, baseDay, baseDay, baseDay]
const programDay = Joi.array().items(Joi.valid(1, 0, -1).required()).length(48).required().allow(false)

const schema = Joi.object().keys({
  name: Joi.string().required().default('Unconfigured thermostat state scenario'),

  // state controlled by scenario
  stateId: Joi.string().guid().allow('').required().default(''),
  highLevel: Joi.number().integer().min(1).max(32).required().default(6),
  lowLevel: Joi.number().integer().min(1).max(32).required().default(3),
  offLevel: Joi.number().integer().min(1).max(32).required().default(2),

  // programs
  program: Joi.array().items(programDay.required().default(baseDay)).length(7).required().default(baseProgramWeek),
  overriddenProgram: programDay.required().default(false),

  // enslaving with a temperature measure
  temperatureStateId: Joi.string().guid().allow('').required().default(''),
  maxTemperature: Joi.number().integer().min(10).max(38).required().default(28),
  minTemperature: Joi.number().integer().min(8).max(36).required().default(15),
  highTemperature: Joi.number().multiple(0.5).min(10).max(38).allow(false).required().default(false),
  lowTemperature: Joi.number().multiple(0.5).min(8).max(36).allow(false).required().default(false),
  offTemperature: Joi.number().integer().min(4).max(32).allow(false).required().default(false),

  // current states
  forceModeEnd: Joi.number().integer().min(1514203932000).max(2240050332000).allow(false).required().default(false), // false means no force mode, else, timestamp to the end of the mode.
  overrideEnd: Joi.number().integer().min(1514203932000).max(2240050332000).allow(false).required().default(false),

  activated: Joi.boolean().required().default(true)
})

export default schema
