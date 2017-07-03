'use strict'

import webpack from 'webpack'

class BrowserPack {
  constructor () {
    this.options = require(`./builder/${process.env.NODE_ENV || 'development'}.js`).default
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
      server.express.use(middleware(compiler, { publicPath: '/build' }))
      server.express.listen(3000, () => {
        console.log('Webpack Hot reloading listening on port 3000!')
      })
    }
  }
}

export default new BrowserPack()
