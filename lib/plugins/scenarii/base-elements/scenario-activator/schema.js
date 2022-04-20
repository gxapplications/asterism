'use strict'

import Joi from 'joi'

const schema = Joi.object().keys({
  name: Joi.string().required().default('Unconfigured scenario activator'),
  scenarioId: Joi.string().guid().allow('').required().default(''), // TODO !5: put an array here?
  operation: Joi.string().required().valid('activate', 'deactivate', 'switch').default('switch'),
  immediately: Joi.boolean().required().default(true)
  // TODO !5: add a boolean abortWhenDisable, to optionally abort during disabling
})

export default schema
