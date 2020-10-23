'use strict'

import Joi from 'joi'

const schema = Joi.object().keys({
  name: Joi.string().required().default('Unconfigured bitmask state condition'),
  bitmaskStateId: Joi.string().guid().allow('').required().default(''),
  position: Joi.number().integer().min(1).max(8).required().default(1),
  operator: Joi.string().required().valid('position-set', 'position-unset', 'position-only-set', 'position-only-unset',
    'all-unset', 'all-set', 'only-one-set', 'only-one-unset', 'have-both').default('position-set')
})

export default schema
