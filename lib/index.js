'use strict'

import Browser from './browser'
import Server from './server'
//import f from '../babel-sass-preprocess'

const { serverWebPush, browserWebPush } = Server.getWebPushParameters()
const browser = new Browser(browserWebPush)
const server = new Server(serverWebPush)

if (process.argv.includes('--build')) {
  server.on('start', browser.pack.bind(browser, server))
} else {
  // Need a listener, even if nothing to do...
  server.on('start', (callback) => {
    callback()
  })
}

export { server as server } // eslint-disable-line no-useless-rename
export { browser as browser } // eslint-disable-line no-useless-rename
