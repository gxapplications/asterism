'use strict'

require('babel-core/register')
require('colors')

const server = require('../lib').server

server.use(require('../lib/plugins/scenarii'))
server.use(require('../lib/plugins/navigation-tools'))
server.use(require('../lib/plugins/developer-tools'))

if (process.env.ASTERISM_PLUGINS) {
  process.env.ASTERISM_PLUGINS.split(',').forEach((plugin) => {
    try {
      console.log(`Loading plugin at path ${require.resolve(plugin)}`.green)
      server.use(require(plugin))
    } catch (error) {
      console.log(`The plugin ${plugin} cannot be found as dependency. Did you miss a npm link for it?`.red)
      console.error(error)
    }
  })
}

server.start(6000, ['127.0.0.1', '0.0.0.0', '::1', '192.168.10.186'], function () {
  console.log('Hot-reload mode Asterism listening on port 6080/6443!'.green)
})
