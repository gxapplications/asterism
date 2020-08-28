'use strict'

import Joi from '@hapi/joi'

const schema = Joi.object().keys({
  name: Joi.string().required().default('Unnamed log for developers')
})

export default schema
