'use strict'

require('babel-core/register')
const server = require('../lib').server

// TODO !3: add module via server.use()

server.start(8090, function () {
  console.log('Hot-reload mode Asterism listening on port 8090!')
})
