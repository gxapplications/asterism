'use strict'

import Joi from '@hapi/joi'

const schema = Joi.object().keys({
  name: Joi.string().required().default('Unconfigured thermostat comfort forcer'),
  thermostatStateScenarioId: Joi.string().guid().allow('').required().default('')
})

export default schema
