'use strict'

import webpack from 'webpack'

class BrowserPack {
  constructor () {
    this.options = require(`./builder/${process.env.NODE_ENV || 'development'}`).default
  }

  pack (server, callback = () => {}) {
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

      // We have to make 2 passes: webpack will sometimes forget some files
      // (due to file system events outdated at compile time?) - most often on Windows...
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
        setTimeout(callback, 1000)
      })
    })
  }
}

export default new BrowserPack()
