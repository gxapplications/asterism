'use strict'

import express from 'express'
import Path from 'path'

export default class AssetsService {
  fallback () {
    const router = express.Router()

    router.get(/^(?!\/build|\/__webpack).*$/, (req, res, next) => {
      if (/\.hot-update\.js/.test(req.path)) {
        return next()
      }

      if (req.path.length > 0 && /[^/]$/.test(req.path)) {
        console.log('Path fixed and redirected', req.path)
        return res.redirect(301, `${req.path}/`)
      }

      res.sendFile(Path.join(__dirname, '..', '..', 'assets', process.env.NODE_ENV || 'development', 'index.html'))
    })

    return router
  }

  middlewares () {
    const middlewares = {
      '/assets/': express.static(Path.join(__dirname, '..', '..', 'assets', process.env.NODE_ENV || 'development')),
      '/jquery/': express.static(Path.resolve('.', 'node_modules', 'jquery', 'dist')),
      '/materialize-css/': express.static(Path.resolve('.', 'node_modules', 'materialize-css', 'dist')),
      '/socket.io-client/': express.static(Path.resolve('.', 'node_modules', 'socket.io-client', 'dist')),
      '/favicon.ico': express.static(Path.join(__dirname, '..', '..', 'assets'))
    }

    if (process.env.NODE_ENV === 'production') {
      console.log('Adding production specific routes...'.grey)
      middlewares['/build/'] = express.static(Path.resolve('.', 'var', 'build'))
    }

    return middlewares
  }
}
