'use strict'

import Joi from 'joi'

const scriptOrActionId = Joi.alternatives().try(Joi.string().guid().required(), Joi.link('#procedureScript'))
const sequence = Joi.array().min(0).max(32).required().items(scriptOrActionId).default([])
const script = Joi.object().min(1).max(32).required().pattern(/.+/, sequence).default({ a: [] }).id('procedureScript')

const schema = Joi.object().keys({
  name: Joi.string().required().default('Unconfigured procedure'),
  script
})

export default schema
