'use strict'

import Joi from 'joi'
import NpmJoi from './npm-package-name-joi-validator'

const serverSchema = Joi.object().keys({
  middlewares: Joi.func().maxArity(1).optional(),
  publicSockets: Joi.array().items(Joi.string().required()).optional()
}).unknown()

const browserSchema = Joi.object().keys({
  itemFactory: Joi.string().optional(),
  settingsPanel: Joi.string().optional(),
  editPanels: Joi.array().optional(),
  publicSockets: Joi.array().items(Joi.string().required()).optional(),
  services: Joi.func().maxArity(1).optional(),
  styles: Joi.string().optional()
}).unknown()

const schema = Joi.object().keys({
  name: Joi.string().min(2).max(32).required(),
  libName: NpmJoi.npmPackageName().allow(null).optional(),
  version: [
    Joi.number().integer().min(20170101).max(20421231).required(),
    Joi.string().regex(/^[0-9]{1,8}\.[0-9]{1,8}\.[0-9]{1,8}$/).required()
  ],
  privateSocket: Joi.boolean().required().default(false),
  dependencies: Joi.array().items(Joi.string().required()).optional(),
  server: serverSchema.required(),
  browser: browserSchema.required()
}).unknown()

export default schema
