'use strict'

import { version } from '../../../package.json'

const manifest = {
  name: 'Monitor',
  libName: 'asterism-monitor',
  version,
  privateSocket: true,
  dependencies: [
    'asterism-scenarii'
  ],
  server: {
    publicSockets: [
      'asterism/monitor'
    ],
    middlewares: (context) => [
      `asterism/${process.env.NODE_ENV === 'production' ? 'dist' : 'lib'}/plugins/monitor/scenarii/server-middleware`
    ]
  },
  browser: {
    publicSockets: [
      'asterism/monitor'
    ],
    services: (context) => [
      `asterism/${process.env.NODE_ENV === 'production' ? 'dist' : 'lib'}/plugins/monitor/scenarii/browser-service`
    ],
    itemFactory: `asterism/${process.env.NODE_ENV === 'production' ? 'dist' : 'lib'}/plugins/monitor/item-factory`
  }
}

export default manifest
