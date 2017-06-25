'use strict'

const manifest = {
  name: 'Developer-tools',
  version: '1.0.0',
  privateSocket: true,
  server: {
    publicSockets: [
      'asterism/developer-tools/log'
    ],
    middlewares: (context) => [
      `asterism/${process.env.NODE_ENV === 'production' ? 'dist' : 'lib'}/plugins/developer-tools/socket-logger/middleware`
    ]
  },
  browser: {
    publicSockets: [
      'asterism/developer-tools/log'
    ],
    itemFactory: `asterism/${process.env.NODE_ENV === 'production' ? 'dist' : 'lib'}/plugins/developer-tools/item-factory`,
    settingsPanel: `asterism/${process.env.NODE_ENV === 'production' ? 'dist' : 'lib'}/plugins/developer-tools/settings`
  }
}

export default manifest
