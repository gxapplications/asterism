'use strict'

import { Scenarii } from 'asterism-plugin-library'

import DevtoolsLogActionEditForm from './edit-form'

const { BrowserAction } = Scenarii

class BrowserDevtoolsLogAction extends BrowserAction {
  get name () {
    return this.data.name || 'Unnamed log for developers'
  }
  get shortLabel () {
    return `Logs '${this.data.name}'`
  }
  get fullLabel () {
    return `Logs '${this.data.name}' message into devtools logs`
  }

  get EditForm () {
    return DevtoolsLogActionEditForm
  }
}

BrowserDevtoolsLogAction.type = Object.assign({}, BrowserAction.type, {
  name: 'DevtoolsLogAction',
  shortLabel: 'Simple log action',
  fullLabel: 'A simple log action for developers',
  icon: 'bug_report'
})

export default BrowserDevtoolsLogAction
