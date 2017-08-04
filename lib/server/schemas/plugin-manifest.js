'use strict'

import Joi from 'joi'

const serverSchema = Joi.object().keys({
  middlewares: Joi.func().maxArity(1)
}).unknown()

const browserSchema = Joi.object().keys({
  components: Joi.array().optional(),
  settingsPanel: Joi.string().optional()
}).unknown()

const schema = Joi.object().keys({
  name: Joi.string().min(2).max(32).required(),
  version: [
    Joi.number().integer().min(20170101).max(20421231).required(),
    Joi.string().regex(/^[0-9]{1,8}\.[0-9]{1,8}\.[0-9]{1,8}$/).required()
  ],
  server: serverSchema,
  browser: browserSchema
}).unknown()

export default schema
