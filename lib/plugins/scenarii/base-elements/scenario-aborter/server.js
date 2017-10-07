'use strict'

import { Scenarii } from 'asterism-plugin-library'
const { ServerAction } = Scenarii

export default class ServerScenarioAborter extends ServerAction {
  get name () {
    return this.data.name ? `Abort ${this.data.name}` : `Misconfigured scenario aborter`
  }

  execute (executionId) {
    return ServerScenarioAborter.scenariiService.forceAbortScenarioInstance({ instanceId: this.data.scenarioId })
  }
}
