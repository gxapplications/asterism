'use strict'

import Joi from 'joi'

const schema = Joi.object().keys({
  name: Joi.string().required().default('Unconfigured level state condition'),
  levelStateId: Joi.string().guid().allow('').required().default(''),
  operator: Joi.string().required().valid('eq', 'gte', 'lte', 'between').default('eq'),
  level: Joi.number().integer().min(1).max(32).required().default(1),
  level2: Joi.number().integer().min(1).max(32).required().default(2)
})

export default schema
