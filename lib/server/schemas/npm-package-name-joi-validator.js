'use strict'

import Joi from '@hapi/joi'
import npmPackageNameValidator from 'validate-npm-package-name'

export default Joi.extend((joi) => ({
  base: joi.string(),
  name: 'string',
  language: {
    npm: 'needs to be a valid npm package name'
  },
  rules: [
    {
      name: 'npm',
      validate (params, value, state, options) {
        const test = npmPackageNameValidator(value)
        if (!test.validForNewPackages) {
          console.error(test.errors)
          return this.createError('string.npm', { v: value }, state, options)
        }
        return value
      }
    }
  ]
}))
