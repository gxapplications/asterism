'use strict'

import { version } from '../../../package.json'

const manifest = {
  name: 'Developer-tools',
  libName: 'asterism-developer-tools',
  version,
  privateSocket: true,
  dependencies: [
    'asterism-scenarii'
  ],
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
