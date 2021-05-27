'use strict'

import Joi from 'joi'

const schema = Joi.object().keys({
  name: Joi.string().required().default('Unconfigured actionable scenario'),
  executionTrigger: Joi.string().guid().allow('').required().default(''),
  abortTrigger: Joi.string().guid().allow('').required().default(''),
  executionCondition: Joi.string().guid().allow('').required().default(''),
  action: Joi.string().guid().allow('').required().default(''),
  activated: Joi.boolean().required().default(true)
})

export default schema
