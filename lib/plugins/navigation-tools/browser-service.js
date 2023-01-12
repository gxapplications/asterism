'use strict'

import speechCommands from './speech-commands'

export default class NavigationToolsService {
  constructor ({ privateSocket, speechManager }) {
    speechManager.connectCommandGenerator(speechCommands({
      navigationToolsService: this,
      privateSocket
    }))
  }
}
