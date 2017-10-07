'use strict'

let _socketIo = null

const middleware = (context, router) => {
  const logger = context.logger

  router.connectPlugin = () => {
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

  return router
}

export default middleware
