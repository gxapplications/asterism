'use strict'

import BrowserDevtoolsLogAction from './devtools-log-action/browser'
import devtoolsLogActionSchema from './devtools-log-action/schema'

export default class DevtoolsScenariiService {
  constructor ({ getServices, notificationManager, mainState, privateSocket, publicSockets }) {
    this.scenariiService = getServices()['asterism-scenarii']

    // Register devtools elements
    const elements = [
      { id: 'devtools-log-action', browserClass: BrowserDevtoolsLogAction, dataSchema: devtoolsLogActionSchema }
    ]

    elements.forEach(({ id, browserClass, dataSchema }) => {
      this.scenariiService.registerElementType(id, browserClass, dataSchema)
    })
  }
}
