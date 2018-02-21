'use strict'

import browser from './browser'
import server from './server'

server.on('start', browser.pack.bind(browser, server))

export { server as server } // eslint-disable-line no-useless-rename

// TODO !0: babel upgrade:
/*
1.change presets:
      "node7",
      "es2017-node7/webpack2",
      "react-es2015"
  to:
      "env", (old package babel-preset-env for now)
      "es2017-node7/webpack2",
      "react"

  Make the same on plugins lib, zwave, ipcam, test all these run ways:
  - npm start
  - npm run start:dist
  - npm start from zwave
  - npm start from asterism-fo-domotics
  - npm test

2.then customize env conf to reduce babel heavility (test adding an scenarii simple action item)
*/
