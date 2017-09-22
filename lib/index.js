'use strict'

import browser from './browser'
import server from './server'

server.on('start', browser.pack.bind(browser, server))

export { server as server }

// TODO !6: update/exchange groc dependency (obsolete, too many unsecured sub-deps)
