'use strict'

import Joi from 'joi'

const schema = Joi.object().keys({
  name: Joi.string().required().default('Unconfigured wait timer'),
  waitMode: Joi.string().required().valid('amount', 'until', 'untilQuarter').default('amount'),
  amount: Joi.number().integer().min(1).max(600).required().default(1),
  amountUnit: Joi.string().required().valid('seconds', 'minutes', 'hours').default('seconds'),
  until: Joi.string().required().default('12:00'),
  untilOccurrence: Joi.string().required().valid('first', 'tomorrow').default('first'),
  untilQuarter: Joi.string().required().valid('00/15/30/45', '00/30', '00', '15', '30', '45').default('00/15/30/45')
})

export default schema
