'use strict'

import express from 'express'
import Path from 'path'

export default class AssetsService {
  middlewares () {
    const middlewares = {
      '/$': express.static(Path.join(__dirname, '..', '..', 'assets', process.env.NODE_ENV || 'development')),
      '/jquery/': express.static(Path.resolve('.', 'node_modules', 'jquery', 'dist')),
      '/materialize-css/': express.static(Path.resolve('.', 'node_modules', 'materialize-css', 'dist')),
      '/socket.io-client/': express.static(Path.resolve('.', 'node_modules', 'socket.io-client', 'dist'))
    }

    if (process.env.NODE_ENV === 'production') {
      console.log('Adding production specific routes...'.grey)
      middlewares['/build/'] = express.static(Path.resolve('.', 'var', 'build'))
    }

    return middlewares
  }
}
