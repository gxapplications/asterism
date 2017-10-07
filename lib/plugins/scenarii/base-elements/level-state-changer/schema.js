'use strict'

import Joi from 'joi'

const schema = Joi.object().keys({
  name: Joi.string().required().default('Unconfigured level state update'),
  levelStateId: Joi.string().guid().allow('').required().default(''),
  operation: Joi.string().required().valid('increment', 'decrement', 'replace').default('replace'),
  amount: Joi.number().integer().min(1).max(32).required().default(1)
})

export default schema
