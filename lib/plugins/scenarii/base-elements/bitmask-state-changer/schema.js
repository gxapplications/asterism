'use strict'

import Joi from '@hapi/joi'

const schema = Joi.object().keys({
  name: Joi.string().required().default('Unconfigured bitmask state update'),
  bitmaskStateId: Joi.string().guid().allow('').required().default(''),
  position: Joi.number().integer().min(1).max(8).required().default(1),
  operation: Joi.string().required().valid('set-position', 'unset-position', 'invert-position', 'unset-all', 'set-all').default('set-position')
})

export default schema
