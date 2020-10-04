'use strict'

import Joi from '@hapi/joi'

const schema = Joi.object().keys({
  name: Joi.string().required().default('Unconfigured bitmask state trigger'),
  bitmaskStateId: Joi.string().guid().allow('').required().default(''),
  position: Joi.number().integer().min(1).max(8).required().default(1),
  operator: Joi.string().required().valid('position-set', 'position-unset', 'position-move', 'any-set', 'any-unset', 'any-move').default('position-move')
})

export default schema
