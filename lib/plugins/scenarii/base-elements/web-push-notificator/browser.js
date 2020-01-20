'use strict'

import { Scenarii } from 'asterism-plugin-library'

import BrowserWebPushNotificatorEditForm from './edit-form'

const { BrowserAction } = Scenarii

class BrowserWebPushNotificator extends BrowserAction {
  get name () {
    return this.data.name ? `Notify ${this.data.name}` : `Misconfigured notification`
  }
  get shortLabel () {
    return this.data.name ? `Notifies browsers: ${this.data.name}` : this.name
  }
  get fullLabel () {
    return this.data.name ? `Notifies browsers (${this.data.name}) even if the interface is closed.` : this.name
  }

  get EditForm () {
    return BrowserWebPushNotificatorEditForm
  }
}

BrowserWebPushNotificator.type = Object.assign({}, BrowserAction.type, {
  name: 'Web Push notificator',
  shortLabel: 'Web Push notificator',
  fullLabel: 'Push a notification on client browsers.',
  icon: 'notifications_active'
})

export default BrowserWebPushNotificator
