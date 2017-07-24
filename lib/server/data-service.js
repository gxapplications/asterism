'use strict'

import express from 'express'

export default class DataService {
  router () {
    const router = express.Router()

    router.get('/data/:key', (req, res) => {

    })

    router.put('/data/:key', (req, res) => {

    })

    router.delete('/data/:key', (req, res) => {

    })

    // TODO !0: routes GET et POST/PUT servant un storage coté serveur https://www.npmjs.com/package/nosql

    return router
  }
}
