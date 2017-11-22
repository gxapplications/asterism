'use strict'

import { Scenarii } from 'asterism-plugin-library'

import { sleep } from '../../../../browser/tools'

const { ServerAction } = Scenarii

export default class ServerDevtoolsLogAction extends ServerAction {
  get name () {
    return this.data.name || 'Unnamed log for developers'
  }

  execute () {
    return sleep(1000)
    .then(() => {
      return new Promise((resolve, reject) => {
        if (ServerDevtoolsLogAction.logger) {
          ServerDevtoolsLogAction.logger.info(this.data.name)
        } else {
          reject(new Error('Logger cannot be reached.'))
        }
        resolve(true)
      })
    })
  }
}
