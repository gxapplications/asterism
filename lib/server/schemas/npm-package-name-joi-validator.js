'use strict'

import Joi from 'joi'
import npmPackageNameValidator from 'validate-npm-package-name'

export default Joi.extend((joi) => ({
  type: 'npmPackageName',
  base: joi.string(),
  messages: {
    'npmPackageName.npm': '{{#v}} needs to be a valid npm package name'
  },
  validate (value, helpers) {
    const test = npmPackageNameValidator(value)
    if (!test.validForNewPackages) {
      console.error(test.errors)
      return { value, errors: helpers.error('npmPackageName.npm', { v: value }) }
    }
  }
}))
