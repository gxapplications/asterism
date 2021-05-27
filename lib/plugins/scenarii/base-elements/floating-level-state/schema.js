'use strict'

import Joi from 'joi'

const schema = Joi.object().keys({
  name: Joi.string().required().default('Unconfigured floating level state'),
  precision: Joi.number().integer().min(2).max(8).required().default(4),
  min: Joi.number().integer().min(-65534).max(65535).required().default(-10),
  max: Joi.number().integer().min(-65534).max(65535).required().default(63),
  state: Joi.number().precision(8).min(Joi.ref('min')).max(Joi.ref('max')).required().default(0)
})

export default schema
