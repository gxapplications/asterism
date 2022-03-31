'use strict'

import { Scenarii } from 'asterism-plugin-library'

import BrowserSurveyScenarioEditForm from './edit-form'

const { BrowserScenario } = Scenarii

class BrowserSurveyScenario extends BrowserScenario {
  get name () {
    return this.data.name ? `Survey ${this.data.name}` : 'Misconfigured survey scenario'
  }

  get shortLabel () {
    return this.data.name ? `Survey scenario (${this.data.name})` : this.name
  }

  get fullLabel () {
    return this.data.name ? `Alarm Survey area (${this.data.name}).` : this.name
  }

  get EditForm () {
    return BrowserSurveyScenarioEditForm
  }

  presave (services) {
    // TODO !5: what to do here ?
    return Promise.resolve()
  }
}

BrowserSurveyScenario.type = Object.assign({}, BrowserScenario.type, {
  name: 'Survey scenario',
  shortLabel: 'Survey scenario',
  fullLabel: 'Alarm survey for limited area.',
  icon: 'notification_important'
})

export default BrowserSurveyScenario
