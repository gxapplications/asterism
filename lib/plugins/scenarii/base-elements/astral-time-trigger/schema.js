'use strict'

import Joi from '@hapi/joi'

const schema = Joi.object().keys({
  name: Joi.string().required().default('Unconfigured astral time trigger'),
  event: Joi.string().required().valid('sunrise', 'sunset', 'solarNoon', 'night').default('sunrise'),
  timeshift: Joi.number().integer().min(-180).max(180).required().default(0),
  limitedWindowLow: Joi.number().integer().min(0).max(1440).required().default(0),
  limitedWindowHigh: Joi.number().integer().min(0).max(1440).required().default(1440)
})

export default schema
