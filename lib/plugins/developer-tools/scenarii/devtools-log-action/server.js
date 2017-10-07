'use strict'

import { Scenarii } from 'asterism-plugin-library'

import { sleep } from '../../../../browser/tools'

const { ServerAction } = Scenarii

export default class ServerDevtoolsLogAction extends ServerAction {
  get name () {
    return this.data.name || 'Unnamed log for developers'
  }

  execute (executionId) {
    const action = sleep(1000) // step 1
    .then(() => { // step 2
      /* if (!this.executionIds[executionId]) {
        return Promise.resolve(false) // abort case
      } */

      return new Promise((resolve, reject) => {
        if (ServerDevtoolsLogAction.logger) {
          ServerDevtoolsLogAction.logger.info(this.data.name)
        } else {
          reject(new Error('Logger cannot be reached.'))
        }
        resolve(true)
      })
    })
    // this.executionIds[executionId] = action

    return action // .then(() => { delete this.executionIds[executionId] }).catch(() => { delete this.executionIds[executionId] })
  }

  /* abort (executionId) {
    if (!this.executionIds[executionId]) {
      return Promise.reject(new Error('Action execution already stopped.'))
    }

    this.executionIds[executionId] = null // will abort on step 2
    return Promise.resolve(false)
  } */
}
