'use strict'

import { Scenarii } from 'asterism-plugin-library'
const { ServerAction } = Scenarii

export default class ServerWebPushNotificator extends ServerAction {
  get name () {
    return this.data.name ? `Notify ${this.data.name}` : `Misconfigured notification`
  }

  execute (executionId) {
    // TODO: dispo ici : ServerWebPushNotificator.notificationHandler.pushNotificationMessage(title, body, level = 'info', options = {})
  }
}
