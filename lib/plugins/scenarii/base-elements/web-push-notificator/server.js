'use strict'

import { Scenarii } from 'asterism-plugin-library'
const { ServerAction } = Scenarii

export default class ServerWebPushNotificator extends ServerAction {
  get name () {
    const body = this.data.body.length > 16 ? this.data.body.substring(0, 13) + '...' : this.data.body
    return this.data.body ? `Notify "${body}"` : 'Misconfigured notification'
  }

  execute (executionId) {
    try {
      ServerWebPushNotificator.notificationHandler.pushNotificationMessage(
        this.data.title || 'From Asterism',
        this.data.body || '',
        this.data.level || 'info',
        { tag: this.data.unicity || undefined, renotify: this.data.unicity.length ? false : undefined }
      )
      return Promise.resolve(true)
    } catch (error) {
      return Promise.reject(error)
    }
  }
}
