'use strict'

import Joi from 'joi'

const schema = Joi.object().keys({
  name: Joi.string().required().default('Unconfigured time based trigger'),
  dayMode: Joi.string().required().valid('everyday', 'weekdays', 'dayInMonth', 'dayAndMonth', 'weekdayInMonth').default('everyday'),
  timeMode: Joi.string().required().valid('hourMinute', 'eachQuarter', 'eachHalf', 'eachHour').default('hourMinute'),
  weekdays: Joi.array().min(0).max(7).required().items(Joi.number().integer().min(0).max(6)).default([1, 2, 3, 4, 5]),
  dayInMonth: Joi.array().min(1).max(31).required().items(Joi.number().integer().min(1).max(31)).default([1]),
  dayAndMonth: Joi.array().min(1).max(32).required().items(Joi.number().integer().min(32).max(414).disallow(93, 94, 158, 222, 318, 382)).default([408]), // formula: (month << 5) + (day-1)
  weekdayInMonth: Joi.array().min(1).max(32).required().items(Joi.array().min(2).max(2).items(Joi.number().integer())).default([[1, 1]]), // first monday of month by default
  hourMinute: Joi.array().min(1).max(32).required().items(Joi.string()).default(['12:00'])
})

export default schema
