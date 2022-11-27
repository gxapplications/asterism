'use strict'

const babelRegister = require('@babel/register')
require('colors')

const server = require('../lib').server

server.use(require('../lib/plugins/scenarii'))
server.use(require('../lib/plugins/navigation-tools'))
server.use(require('../lib/plugins/developer-tools'))
server.use(require('../lib/plugins/monitor'))

if (process.env.ASTERISM_PLUGINS) {
  process.env.ASTERISM_PLUGINS.split(',').forEach((plugin) => {
    try {
      babelRegister({
        root: `../../${plugin}`,
        extends: './.babelrc',
        ignore: [/node_modules/],
        cache: true
      })
      console.log(`Loading plugin at path ${require.resolve(plugin)}`.green)
      server.use(require(plugin))
    } catch (error) {
      console.log(`The plugin ${plugin} cannot be found as dependency. Did you miss a 'npm run wrap' or 'npm link' for it?`.red)
      console.error(error)
    }
  })
}

server.start(6000, ['127.0.0.1', '0.0.0.0', '::1', '192.168.1.111', '192.168.1.6', '::ffff:172.19.0.1'], function () {
  console.log('Hot-reload mode Asterism listening on port 6080/6443!'.green)
})
