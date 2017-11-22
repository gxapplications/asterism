/* eslint-env mocha */
'use strict'

import Joi from 'joi'
import uuid from 'uuid'

import schema from '../../../../../../lib/plugins/scenarii/base-elements/procedure/schema.js'

describe('Plugin scenarii - procedure schema', function () {
  it('A minimalist procedure is validated', function () {
    const procedureData = {
      script: {
        'a': []
      }
    }
    return Joi.validate(procedureData, schema)
  })

  it('An incomplete procedure is rejected', function (done) {
    const procedureData = {
      script: { }
    }
    Joi.validate(procedureData, schema)
    .then(() => done(new Error()))
    .catch(() => done())
  })

  it('An void data procedure is rejected', function (done) {
    const procedureData = { }
    Joi.validate(procedureData, schema)
    .then(() => done(new Error()))
    .catch(() => done())
  })

  it('A simple procedure is validated', function () {
    const procedureData = {
      script: {
        'a': [
          {
            'b': [ uuid.v4() ],
            'c': [ uuid.v4() ],
            'd': [
              {
                'e': [ uuid.v4() ],
                'f': []
              }
            ]
          },
          {
            'g': [ uuid.v4() ],
            'h': []
          },
          uuid.v4()
        ],
        'i': [ uuid.v4() ]
      }
    }
    return Joi.validate(procedureData, schema)
  })
})
