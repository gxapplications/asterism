'use strict'

import Joi from 'joi'

const colors = ['red', 'blue', 'green', 'yellow', 'white', 'none']
const defaultColors = ['green', 'yellow', 'red']

const schema = Joi.object().keys({
  name: Joi.string().required().default('Unconfigured level state'),
  max: Joi.number().integer().min(2).max(32).required().default(3),
  colors: Joi.array().items(Joi.string().valid(colors).required()).length(Joi.ref('max')).required().default(defaultColors),
  state: Joi.number().integer().min(1).max(Joi.ref('max')).required().default(1)
})

schema.colors = colors

export default schema
