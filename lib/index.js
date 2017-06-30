'use strict'

import browser from './browser'
import server from './server'

server.on('start', browser.pack)

export { server as server }
