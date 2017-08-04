'use strict'

const manifest = {
  name: 'Developer-tools',
  version: '0.0.1',
  private_channels: [
    // TODO !5: here, declare socket channels that will be (auto prefixed and) auto mounted and injected into server & browser contexts.
  ],
  server: {
    public_channels: [
      // TODO !5: here, declare socket channels that will be auto mounted and injected into server contexts.
    ],
    middlewares: (context) => [

    ]
  },
  browser: {
    public_channels: [
      // TODO !5: here, declare socket channels that will be auto mounted and injected into browser contexts.
    ],
    itemFactory: `asterism/${process.env.NODE_ENV === 'production' ? 'dist' : 'lib'}/plugins/developer-tools/item-factory`,
    settingsPanel: `asterism/${process.env.NODE_ENV === 'production' ? 'dist' : 'lib'}/plugins/developer-tools/settings`
  }
}

export default manifest
