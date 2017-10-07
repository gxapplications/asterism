'use strict'

import Joi from 'joi'

const schema = Joi.object().keys({
  name: Joi.string().required().default('Unconfigured action aborter'),
  actionId: Joi.string().guid().allow('').required().default('')
})

export default schema
