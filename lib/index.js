'use strict'

import browser from './browser'
import server from './server'

server.on('start', browser.pack.bind(browser, server))

export { server as server } // eslint-disable-line no-useless-rename

// TODO !1: upgrade to react 16.2.x, then react-materialize 2.1.2, then react-gridifier ^0.5.0
