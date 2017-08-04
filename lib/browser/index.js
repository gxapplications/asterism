'use strict'

import webpack from 'webpack'

class BrowserPack {
  constructor () {
    this.options = require(`./builder/${process.env.NODE_ENV || 'development'}`).default
  }

  pack (server) {
    console.log(`Webpack launched in ${process.env.NODE_ENV} mode.`)
    const options = this.options(server)
    const compiler = webpack(options)

    if (process.env.NODE_ENV !== 'production') {
      const middleware = require('webpack-dev-middleware')
      const hotMiddleware = require('webpack-hot-middleware')
      server.express.use(middleware(compiler, options.devServer))
      server.express.use(hotMiddleware(compiler))
    }

    compiler.run((err, _stats) => {
      if (err) {
        return console.error('Webpack error.', err)
      }
      const stats = _stats.toJson()
      if (_stats.hasErrors()) {
        return console.error('Webpack errors.', stats.errors)
      }
      if (this.options.watch && _stats.hasWarnings()) {
        console.error('Webpack warnings', stats.warnings)
      }
      console.log('Webpack build #1 done.')

      // FIXME !9: for red.500 error, we make 2 passes (dev mode only). To remove when webpack tree-shaking stabilized.
      if (process.env.NODE_ENV !== 'production') {
        compiler.run((err, _stats) => {
          if (err) {
            return console.error('Webpack error.', err)
          }
          const stats = _stats.toJson()
          if (_stats.hasErrors()) {
            return console.error('Webpack errors.', stats.errors)
          }
          if (this.options.watch && _stats.hasWarnings()) {
            console.error('Webpack warnings', stats.warnings)
          }
          console.log('Webpack build #2 done.')
        })
      }
    })
  }
}

export default new BrowserPack()
