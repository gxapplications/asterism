'use strict'

import { Scenarii } from 'asterism-plugin-library'
const { ServerAction } = Scenarii

export default class ServerActionAborter extends ServerAction {
  get name () {
    return this.data.name ? `Abort ${this.data.name}` : `Misconfigured action aborter`
  }

  execute (executionId) {
    return ServerActionAborter.scenariiService.abortActionData({ instanceId: this.data.actionId })
  }
}
