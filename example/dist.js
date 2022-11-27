'use strict'

require('@babel/register')
require('colors')

const server = require('../dist').server

server.use(require('../dist/plugins/scenarii'))
server.use(require('../dist/plugins/navigation-tools'))
server.use(require('../dist/plugins/monitor'))

server.start(7000, ['127.0.0.1', '0.0.0.0', '::1', '192.168.0/24', '192.168.1/24'], function () {
  console.log('Production-like mode Asterism listening on port 7080/7443!'.green)
})
