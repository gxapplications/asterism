'use strict'

import Joi from 'joi'

const schema = Joi.object().keys({
  name: Joi.string().required().default('Unconfigured scenario aborter'),
  scenarioId: Joi.string().guid().allow('').required().default('')
})

export default schema
