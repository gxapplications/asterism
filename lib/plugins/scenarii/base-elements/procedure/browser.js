'use strict'

import { Scenarii } from 'asterism-plugin-library'

import BrowserProcedureEditForm from './edit-form'

const { BrowserAction } = Scenarii

class BrowserProcedure extends BrowserAction {
  // TODO !2: dynamic getters !
  get name () {
    return this.data.name || 'Unnamed procedure'
  }
  get shortLabel () {
    return 'Procedure that does this...'
  }
  get fullLabel () {
    return 'Procedure that does this, then that, then this.'
  }

  get EditForm () {
    return BrowserProcedureEditForm
  }
}

BrowserProcedure.type = Object.assign({}, BrowserAction.type, {
  name: 'Procedure',
  shortLabel: 'Basic procedure',
  fullLabel: 'A scripted list of actions, played in sequence or simultaneously'
})

export default BrowserProcedure
