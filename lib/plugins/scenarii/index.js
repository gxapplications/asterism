'use strict'

import './scenarii.scss'

const envDir = (process.env.NODE_ENV === 'production') ? 'dist' : 'lib'
const cssFile = (process.env.NODE_ENV === 'production') ? 'styles/scenarii.css' : 'plugins/scenarii/scenarii.scss'

const manifest = {
  name: 'Scenarii',
  libName: 'asterism-scenarii',
  version: '1.0.0',
  privateSocket: true,
  server: {
    middlewares: (context) => [
      `asterism/${process.env.NODE_ENV === 'production' ? 'dist' : 'lib'}/plugins/scenarii/server/middleware`
    ]
  },
  browser: {
    editPanels: [
      `asterism/${envDir}/plugins/scenarii/browser/panel`
    ],
    services: (context) => [
      `asterism/${process.env.NODE_ENV === 'production' ? 'dist' : 'lib'}/plugins/scenarii/browser/service`
    ],
    styles: `asterism/${envDir}/${cssFile}`
  }
}

export default manifest
