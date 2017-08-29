'use strict'

import express from 'express'

const middleware = (context) => {
  // TODO !1: context.publicSockets['asterism/developer-tools/log'] -> listen for console output to send through this socket.
  const router = express.Router()
  router.get('/test/*', (req, res) => {
    return res.json('pouic')
  })
  return router
}

export default middleware
