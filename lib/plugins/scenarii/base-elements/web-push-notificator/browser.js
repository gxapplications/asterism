'use strict'

import { Scenarii } from 'asterism-plugin-library'

import BrowserWebPushNotificatorEditForm from './edit-form'

const { BrowserAction } = Scenarii

class BrowserWebPushNotificator extends BrowserAction {
  get name () {
    const body = this.data.body.length > 16 ? this.data.body.substring(0, 13) + '...' : this.data.body
    return this.data.body ? `Notify "${body}"` : 'Misconfigured notification'
  }

  get shortLabel () {
    const title = this.data.title.length > 16 ? this.data.title.substring(0, 13) + '...' : this.data.title
    const body = this.data.body.length > 16 ? this.data.body.substring(0, 13) + '...' : this.data.body
    return this.data.body ? `Notifies browsers: [${title}] "${body}"` : this.name
  }

  get fullLabel () {
    const title = this.data.title.length > 24 ? this.data.title.substring(0, 21) + '...' : this.data.title
    const body = this.data.body.length > 32 ? this.data.body.substring(0, 29) + '...' : this.data.body
    return this.data.body ? `Notifies browsers ([${title}] - "${body}") even if the interface is closed.` : this.name
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
