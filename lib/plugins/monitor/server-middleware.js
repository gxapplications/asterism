'use strict'

import MonitorService from './server-service'

let _service = null

const middleware = (context, router) => {
  const logger = context.logger
  const dataHandler = context.dataHandler
  const notificationHandler = context.notificationHandler

  router.connectPlugin = (getServices) => {
    const privateSocket = context.privateSocketIo
    const publicSockets = context.publicSocketsIo

    // Instantiate and Register monitor elements
    _service = new MonitorService(
      { getServices, logger, dataHandler, notificationHandler, privateSocket, publicSockets }
    )
    return _service
  }

  return router
}

export default middleware
