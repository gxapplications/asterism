'use strict'

import express from 'express'

export default class DataService {
  router () {
    const router = express.Router()

    const tempMemory = {}

    router.get('/data/:key', (req, res) => {
      if (tempMemory[req.params.key] === undefined) {
        console.log(`DATA GET not found on ${req.params.key}!`, tempMemory)
        return res.sendStatus(404)
      }
      console.log(`DATA GET on ${req.params.key}!`, tempMemory)
      return res.json(tempMemory[req.params.key])
    })

    router.put('/data/:key', (req, res) => {
      const payload = req.body
      if (payload === undefined) {
        delete tempMemory[req.params.key]
      } else {
        tempMemory[req.params.key] = payload
      }
      console.log(`DATA PUT on ${req.params.key}!`, tempMemory)
      return res.sendStatus(204)
    })

    router.delete('/data/:key', (req, res) => {
      delete tempMemory[req.params.key]
      console.log(`DATA DELETE on ${req.params.key}!`, tempMemory)
      return res.sendStatus(200)
    })

    // TODO !8: use a real embedded database for persistance instead of volatile memory: https://www.npmjs.com/package/nosql

    return router
  }
}
