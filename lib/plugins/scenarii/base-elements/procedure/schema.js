'use strict'

import Joi from 'joi'

const scriptOrActionId = Joi.alternatives().try(Joi.string().uuid().required(), Joi.lazy(() => script))
const sequence = Joi.array().min(0).max(32).required().items(scriptOrActionId).default([])
const script = Joi.object().min(1).max(32).required().pattern(/.+/, sequence).default({ 'a': [] })

const schema = Joi.object().keys({
  name: Joi.string().required().default('Unconfigured level state'),
  script
})

export default schema
