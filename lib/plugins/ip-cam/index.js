'use strict'

// Dedicated dependencies:
// jquery-network-camera
// camelopard

const manifest = {
  name: 'IP-Cameras',
  version: '0.1.0',
  privateSocket: false,
  browser: {
    itemFactory: `asterism/${process.env.NODE_ENV === 'production' ? 'dist' : 'lib'}/plugins/ip-cam/item-factory`,
    settingsPanel: `asterism/${process.env.NODE_ENV === 'production' ? 'dist' : 'lib'}/plugins/ip-cam/settings`
  },
  server: {}
}

export default manifest
