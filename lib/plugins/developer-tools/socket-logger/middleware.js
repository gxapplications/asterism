'use strict'

import express from 'express'

let _socketIo = null

const middleware = (context) => {
  const logger = context.logger
  const router = express.Router()

  router.connect = () => {
    _socketIo = context.publicSocketsIo['asterism/developer-tools/log']
    logger.addListener('log', (args) => {
      _socketIo.emit('log', args)
    })
    logger.addListener('info', (args) => {
      _socketIo.emit('info', args)
    })
    logger.addListener('warn', (args) => {
      _socketIo.emit('warn', args)
    })
    logger.addListener('error', (args) => {
      _socketIo.emit('error', args)
    })
  }

  // TODO !1: to remove...
  router.get('/test/*', (req, res) => {
    logger.info('test', req.path)
    return res.json('ok')
  })

  return router
}

export default middleware
