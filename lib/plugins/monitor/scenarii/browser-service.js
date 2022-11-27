'use strict'

export default class MonitorScenariiService {
  constructor ({ getServices, notificationManager, mainState, privateSocket, publicSockets }) {
    this.scenariiService = getServices()['asterism-scenarii']

    if (!this.scenariiService) {
      return // do not register scenarii dependant components if not activated
    }

    // Register monitor elements
    console.log('MonitorScenariiService')
  }
}
