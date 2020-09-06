'use strict'

import 'colors'
import webpack from 'webpack'

class BrowserPack {
  constructor (webPushParams = null) {
    this.options = require(`./builder/${process.env.NODE_ENV || 'development'}`).default
    this.webPushParams = webPushParams
  }

  pack (server, twoPasses = false, callback = () => {}) {
    console.log(`Webpack launched in ${process.env.NODE_ENV} mode.`)
    const sharedCache = {}
    const options = this.options(server, this.webPushParams)
    options.cache = sharedCache // shared cache between both passes to improove perfs
    const compiler = webpack(options)

    compiler.hooks.done.tap('asterismSuccess', (_stats) => {
      const stats = _stats.toString()
      if (_stats.hasErrors()) {
        console.error('Webpack errors!'.red, stats.replace(/^[^]+?ERROR/m, ''))
        return server.stop(() => { process.exit(1) }, 'Webpack errors.')
      }
      if (_stats.hasWarnings()) {
        console.error('Webpack warnings'.yellow, stats)
      }
      console.log('Webpack build done.')
      setTimeout(callback, 500)
    })
    compiler.hooks.failed.tap('asterismFailure', (err) => {
      console.error('Webpack error!'.red, err)
      return server.stop(() => { process.exit(1) }, 'Webpack errors.')
    })

    if (process.env.NODE_ENV !== 'production') {
      const middleware = require('webpack-dev-middleware')
      const hotMiddleware = require('webpack-hot-middleware')
      server.express.use(middleware(compiler, options.devServer))
      server.express.use(hotMiddleware(compiler))
    } else {
      compiler.run()
    }
  }
}

export default BrowserPack
