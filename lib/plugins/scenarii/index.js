'use strict'

import { version } from '../../../package.json'
import './scenarii.scss'

const envDir = (process.env.NODE_ENV === 'production') ? 'dist' : 'lib'
const cssFile = (process.env.NODE_ENV === 'production') ? 'styles/scenarii.css' : 'plugins/scenarii/scenarii.scss'

const manifest = {
  name: 'Scenarii',
  libName: 'asterism-scenarii',
  version,
  privateSocket: true,
  server: {
    middlewares: (context) => [
      `asterism/${envDir}/plugins/scenarii/server/middleware`
    ]
  },
  browser: {
    editPanels: [
      `asterism/${envDir}/plugins/scenarii/browser/panel`
    ],
    services: (context) => [
      `asterism/${envDir}/plugins/scenarii/browser/service`
    ],
    itemFactory: `asterism/${envDir}/plugins/scenarii/item-factory`,
    styles: `asterism/${envDir}/${cssFile}`
  }
}

export default manifest
