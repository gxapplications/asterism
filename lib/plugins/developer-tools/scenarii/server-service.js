'use strict'

import ServerDevtoolsLogAction from './devtools-log-action/server'
import devtoolsLogActionSchema from './devtools-log-action/schema'

export default class ScenariiService {
  constructor ({ getServices, logger, dataHandler, notificationHandler, privateSocket, publicSockets }) {
    this.scenariiService = getServices()['asterism-scenarii']

    if (!this.scenariiService) {
      return // do not register scenarii dependant components if not activated
    }

    // Register devtools elements
    ServerDevtoolsLogAction.logger = logger
    const elements = [
      { id: 'devtools-log-action', serverClass: ServerDevtoolsLogAction, dataSchema: devtoolsLogActionSchema }
    ]

    elements.forEach(({ id, serverClass, dataSchema }) => {
      this.scenariiService.registerElementType(id, serverClass, dataSchema)
    })
  }
}
