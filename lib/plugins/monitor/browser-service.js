'use strict'

export default class MonitorService {
  constructor ({ getServices, notificationManager, mainState, privateSocket, publicSockets }) {
    this.scenariiService = getServices()['asterism-scenarii']

    if (!this.scenariiService) {
      return // do not register scenarii dependant components if not activated
    }

    // Register monitor elements
    //console.log('MonitorService')
    // TODO !1: si rien a faire ici, retirer le service complet.
  }
}
