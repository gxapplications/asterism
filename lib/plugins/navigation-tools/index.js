'use strict'

const envDir = (process.env.NODE_ENV === 'production') ? 'dist' : 'lib'

const manifest = {
  name: 'Navigation-tools',
  libName: 'asterism-navigation-tools',
  version: '1.0.0',
  privateSocket: false,
  server: {},
  browser: {
    itemFactory: `asterism/${envDir}/plugins/navigation-tools/item-factory`
  }
}

export default manifest
