'use strict'

import { Scenarii } from 'asterism-plugin-library'
const { ServerAction } = Scenarii

export default class ServerWait extends ServerAction {
  get name () {
    return this.data.name ? `Wait ${this.data.name}` : `Misconfigured wait timer`
  }

  execute (executionId) {
    // TODO !1
  }
}
