'use strict'

import { version } from '../../../package.json'

const envDir = (process.env.NODE_ENV === 'production') ? 'dist' : 'lib'

const manifest = {
  name: 'Navigation-tools',
  libName: 'asterism-navigation-tools',
  version,
  privateSocket: false,
  server: {},
  browser: {
    itemFactory: `asterism/${envDir}/plugins/navigation-tools/item-factory`,
    services: (context) => [
      `asterism/${envDir}/plugins/navigation-tools/browser-service`,
    ],
  }
}

export default manifest
