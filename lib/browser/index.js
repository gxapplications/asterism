'use strict'

import webpack from 'webpack'

class BrowserPack {
  constructor () {
    this.options = require(`./builder/${process.env.NODE_ENV || 'development'}`).default
  }

  pack (server) {
    console.log(`Webpack launched in ${process.env.NODE_ENV} mode.`)

    const compiler = webpack(this.options, (err, _stats) => {
      if (err) {
        console.error('Webpack error.', err)
      }

      const stats = _stats.toJson()
      if (_stats.hasErrors()) {
        console.error('Webpack errors.', stats.errors)
      }
      if (this.options.watch && _stats.hasWarnings()) {
        console.error('Webpack warnings', stats.warnings)
      }

      console.log('Webpack build done.')
    })

    if (process.env.NODE_ENV !== 'production') {
      const middleware = require('webpack-dev-middleware')
      const hotMiddleware = require('webpack-hot-middleware')
      server.express.use(middleware(compiler, { publicPath: '/build' }))
      server.express.use(hotMiddleware(compiler))
    }
  }
}

export default new BrowserPack()
