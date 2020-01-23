'use strict'

import Joi from 'joi'

const schema = Joi.object().keys({
  title: Joi.string().required().max(64).default('From Asterism'),
  body: Joi.string().required().default('Hello world!'),
  level: Joi.string().required().valid(['info', 'warning', 'error']).default('info'),
  unicity: Joi.string().required().max(32).allow('').default('')
})

export default schema
