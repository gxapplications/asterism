'use strict'

import browser from './browser'
import server from './server'

server.on('start', browser.pack.bind(browser, server))

export { server as server } // eslint-disable-line no-useless-rename
