'use strict'

import express from 'express'

export default class DataService {
  constructor (dataHandler) {
    this.dataHandler = dataHandler
  }

  router () {
    const router = express.Router()

    router.get('/data/*', (req, res) => {
      const item = this.dataHandler.getItem(req.params[0])
      if (item === undefined) {
        return res.sendStatus(404)
      }
      return res.json(item)
    })

    router.put('/data/*', (req, res) => {
      const payload = req.body
      const result = this.dataHandler.setItem(req.params[0], payload)
      return res.sendStatus(result ? 204 : 500)
    })

    router.delete('/data/*', (req, res) => {
      const result = this.dataHandler.removeItem(req.params[0])
      return res.sendStatus(result ? 200 : 500)
    })

    return router
  }
}
