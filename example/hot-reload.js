'use strict'

require('babel-core/register')
require('colors')

const server = require('../lib').server

server.use(require('../lib/plugins/ip-cam'))
server.use(require('../lib/plugins/developer-tools'))

server.start(8090, ['127.0.0.1', '0.0.0.0', '::1'], function () {
  console.log('Hot-reload mode Asterism listening on port 8090!'.cyan)
})
