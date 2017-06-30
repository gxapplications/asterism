'use strict'

require('babel-core/register')
const server = require('../dist').server

// TODO !3: add module via server.use()

server.start(80, function () {
    console.log('Production-like mode Asterism listening on port 80!')
})
