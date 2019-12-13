'use strict'

import { Scenarii } from 'asterism-plugin-library'

import BrowserActionAborterEditForm from './edit-form'

const { BrowserAction } = Scenarii

class BrowserActionAborter extends BrowserAction {
  get name () {
    return this.data.name ? `Abort ${this.data.name}` : `Misconfigured action aborter`
  }
  get shortLabel () {
    return this.data.name ? `Action aborter for ${this.data.name}` : this.name
  }
  get fullLabel () {
    return this.data.name ? `Aborts all executions of an action (${this.data.name}).` : this.name
  }

  get EditForm () {
    return BrowserActionAborterEditForm
  }
}

BrowserActionAborter.type = Object.assign({}, BrowserAction.type, {
  name: 'Action aborter',
  shortLabel: 'Action aborter',
  fullLabel: 'Abort all executions of another action.',
  icon: 'report'
})

export default BrowserActionAborter
