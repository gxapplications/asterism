'use strict'

import express from 'express'

export default class WebAppService {
  router () {
    const router = express.Router()

    // https://developers.google.com/web/updates/2015/10/display-mode > detects if launched in fullscreen
    router.get('*/manifest.json', (req, res) => {
      res.type('application/manifest+json')

      return res.json({
        name: 'Asterism is loading...',
        short_name: req.path.replace(/\/manifest\.json$/, '').replace(/^\//, '').replace(/\//, ' ~ ') || 'Asterism',
        scope: '/',
        start_url: '/', // TODO !0: to test, if chrome console warning disappears.
        display: 'fullscreen',
        background_color: '#9e9e9e',
        theme_color: '#009688',
        icons: [{
          src: '/assets/logo.png',
          type: 'image/png',
          sizes: '48x48 72x72 96x96 128x128 144x144 256x256 512x512'
        }],
        categories: ['productivity'],
        description: 'Go to asterism.tk for more information.',
        serviceworker: { // TODO !0: to test... https://developer.mozilla.org/en-US/docs/Web/Manifest/serviceworker
          src: '/web-push-worker.js',
          scope: '/',
          type: '',
          update_via_cache: 'none'
        }
      })
    })

    return router
  }
}
