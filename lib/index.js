'use strict'

import browser from './browser'
import server from './server'

if (process.argv.includes('--build')) {
  server.on('start', browser.pack.bind(browser, server, true))
} else {
  // Need a listener, even if nothing to do...
  server.on('start', (callback) => {
    callback()
  })
}

export { server as server } // eslint-disable-line no-useless-rename
export { browser as browser } // eslint-disable-line no-useless-rename
