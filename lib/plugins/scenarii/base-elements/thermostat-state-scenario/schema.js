'use strict'

import Joi from 'joi'

const baseDay = [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1]
const baseProgramWeek = [baseDay, baseDay, baseDay, baseDay, baseDay, baseDay, baseDay]
const programDay = Joi.array().items().length(48).required().allow(false)

const schema = Joi.object().keys({
  name: Joi.string().required().default('Unconfigured thermostat state scenario'),

  stateId: Joi.string().guid().allow('').required().default(''),
  highLevel: Joi.number().integer().min(1).max(32).required().default(1),
  lowLevel: Joi.number().integer().min(1).max(32).required().default(2),
  offLevel: Joi.number().integer().min(1).max(32).required().default(2),

  program: Joi.array().items(programDay.required().default(baseDay)).length(7).required().default(baseProgramWeek),
  overriddenProgram: programDay.required().default(false),

  // TODO !1: missing a temperature sensor notion in scenarii ! Add a floating number state element type ?
  highTemperature: Joi.number().multiple(0.5).min(10).max(38).allow(false).required().default(false),
  lowTemperature: Joi.number().multiple(0.5).min(8).max(36).allow(false).required().default(false),
  offTemperature: Joi.number().multiple(0.5).min(4).max(32).allow(false).required().default(false),

  activated: Joi.boolean().required().default(true)
})

export default schema
