'use strict'

import Joi from '@hapi/joi'

const schema = Joi.object().keys({
  name: Joi.string().required().default('Unconfigured level state trigger'),
  levelStateId: Joi.string().guid().allow('').required().default(''),
  way: Joi.string().required().valid('reach', 'upward', 'downward', 'left').default('reach'),
  level: Joi.number().integer().min(1).max(32).required().default(1)
})

export default schema
