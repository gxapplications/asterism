'use strict'

require('babel-core/register')
require('colors')

const server = require('../dist').server

server.use(require('../lib/plugins/developer-tools')) // TODO !9: to remove
// TODO !9: add module via server.use()

server.start(8091, function () {
  console.log('Production-like mode Asterism listening on port 8091!'.cyan)
})
