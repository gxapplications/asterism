'use strict'

import Joi from '@hapi/joi'

const schema = Joi.object().keys({
  name: Joi.string().required().default('Unconfigured insecure HTTP call trigger'),
  method: Joi.string().required().valid('POST', 'DELETE', 'PUT', 'PATCH').default('POST'),
  path: Joi.string().required().allow('').default(''),
  success: Joi.string().optional().default('Ok!'),
  error: Joi.string().optional().default('Failed!')
})

export default schema
