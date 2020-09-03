'use strict'

import express from 'express'
import Path from 'path'
import fs from 'fs'

export default class WebAppService {
  router () {
    const router = express.Router()

    // https://developers.google.com/web/updates/2015/10/display-mode > detects if launched in fullscreen
    router.get('*/manifest.json', (req, res) => {
      res.type('application/manifest+json')

      return res.json({
        name: 'Asterism',
        short_name: req.path.replace(/\/manifest\.json$/, '').replace(/^\//, '').replace(/\//, ' ~ ') || 'Asterism',
        start_url: '/',
        display: 'standalone',
        background_color: '#009688',
        theme_color: '#009688',
        icons: [
          {
            src: '/assets/logo-192.png',
            type: 'image/png',
            sizes: '192x192'
          },
          {
            src: '/assets/logo.png',
            type: 'image/png',
            sizes: '512x512'
          },
          {
            src: '/assets/logo-192.png',
            type: 'image/png',
            sizes: '48x48 72x72 96x96 128x128 144x144'
          },
          {
            src: '/assets/logo.png',
            type: 'image/png',
            sizes: '256x256'
          }
        ],
        categories: ['productivity'],
        description: 'Go to asterism.tk for more information.'
      })
    })

    router.get('/web-push-worker.js', (req, res) => {
      const path = Path.join(__dirname, '..', '..', 'assets',
        process.env.NODE_ENV || 'development', 'web-push-worker.js')
      const content = fs.readFileSync(path).toString()
        .replace(/\$VERSIONS\$/g, '1.3.2') // TODO !0: concat all plugin versions

      res.type('text/javascript')
      return res.send(content)
    })

    return router
  }
}
