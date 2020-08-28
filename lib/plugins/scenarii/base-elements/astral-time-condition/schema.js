'use strict'

import Joi from '@hapi/joi'

const schema = Joi.object().keys({
  name: Joi.string().required().default('Unconfigured astral time condition'),
  event: Joi.string().required().valid('sunrise', 'sunset', 'daylight', 'fewlight', 'solarNoon', 'nadir').default('daylight'),
  // sunrise, sunset, solarNoon, nadir: event time +/- timeshift
  // daylight, fewlight: between 2 events, no timeshift
  timeshift: Joi.number().integer().min(5).max(240).required().default(60)
})

export default schema
