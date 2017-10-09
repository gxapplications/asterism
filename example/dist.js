'use strict'

require('babel-core/register')
require('colors')

const server = require('../dist').server

// server.use(require('my-plugin'))

server.start(8091, ['127.0.0.1', '0.0.0.0', '::1', '192.168.0/24', '192.168.1/24'], function () {
  console.log('Production-like mode Asterism listening on port 8091!'.green)
})
