'use strict'

import Joi from 'joi'

const colors = ['red', 'blue', 'green', 'yellow', 'white', 'none']
const defaultColors = ['red', 'blue', 'green', 'yellow']

const schema = Joi.object().keys({
  name: Joi.string().required().default('Unconfigured bitmask state'),
  count: Joi.number().integer().min(1).max(8).required().default(4),
  colors: Joi.array().items(Joi.string().valid(colors).required()).length(Joi.ref('count')).required().default(defaultColors),
  state: Joi.number().integer().min(0).max(255).required().default(0)
})

schema.colors = colors

export default schema
