'use strict'

import express from 'express'

export default class DataService {
  constructor (dataHandler) {
    this.dataHandler = dataHandler
  }

  router () {
    const router = express.Router()

    router.get('/data/:prefix/*', (req, res) => {
      return this.dataHandler.getItem(req.params[0], req.params.prefix)
        .then((item) => {
          if (item === undefined) {
            return res.sendStatus(404)
          }
          return res.json(item)
        })
    })

    router.put('/data/:prefix/*', (req, res) => {
      const payload = req.body
      return this.dataHandler.setItem(req.params[0], payload, req.params.prefix)
        .then((result) => {
          return res.sendStatus(result ? 204 : 500)
        })
    })

    router.delete('/data/:prefix/*', (req, res) => {
      return this.dataHandler.removeItem(req.params[0], req.params.prefix)
        .then((result) => {
          return res.sendStatus(result ? 200 : 500)
        })
    })

    router.get('/data-path/:prefix/:keyName/*', (req, res) => {
      return this.dataHandler.getItem(req.params.keyName, req.params.prefix, req.params[0])
        .then((item) => {
          if (item === undefined) {
            return res.sendStatus(404)
          }
          return res.json(item)
        })
    })

    router.put('/data-path/:prefix/:keyName/*', (req, res) => {
      const payload = req.body
      return this.dataHandler.setItem(req.params.keyName, payload, req.params.prefix, req.params[0])
        .then((result) => {
          return res.sendStatus(result ? 204 : 500)
        })
    })

    router.delete('/data-path/:prefix/:keyName/*', (req, res) => {
      return this.dataHandler.removeItem(req.params.keyName, req.params.prefix, req.params[0])
        .then((result) => {
          return res.sendStatus(result ? 200 : 500)
        })
    })

    router.get('/data-last-by-t/:prefix/:quantity', (req, res) => {
      return this.dataHandler.getLastItemByT(req.params.quantity, req.params.prefix)
        .then((item) => {
          if (item === undefined) {
            return res.sendStatus(404)
          }
          return res.json(item)
        })
    })

    router.get('/data-after-date/:prefix/:timestamp', (req, res) => {
      const fields = (req.query && req.query.f) || null
      return this.dataHandler.getItemsAfterDate(req.params.timestamp, req.params.prefix, fields)
        .then((item) => {
          if (item === undefined) {
            return res.sendStatus(404)
          }
          return res.json(item)
        })
    })

    return router
  }
}
