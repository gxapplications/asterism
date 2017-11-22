'use strict'

const manifest = {
  name: 'Developer-tools',
  libName: 'asterism-developer-tools',
  version: '1.0.0',
  privateSocket: true,
  server: {
    publicSockets: [
      'asterism/developer-tools/log'
    ],
    middlewares: (context) => [
      `asterism/${process.env.NODE_ENV === 'production' ? 'dist' : 'lib'}/plugins/developer-tools/socket-logger/middleware`,
      `asterism/${process.env.NODE_ENV === 'production' ? 'dist' : 'lib'}/plugins/developer-tools/scenarii/server-middleware`
    ]
  },
  browser: {
    publicSockets: [
      'asterism/developer-tools/log'
    ],
    services: (context) => [
      `asterism/${process.env.NODE_ENV === 'production' ? 'dist' : 'lib'}/plugins/developer-tools/scenarii/browser-service`
    ],
    itemFactory: `asterism/${process.env.NODE_ENV === 'production' ? 'dist' : 'lib'}/plugins/developer-tools/item-factory`
  }
}

export default manifest
