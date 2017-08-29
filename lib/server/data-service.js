'use strict'

import express from 'express'

export default class DataService {
  router () {
    const router = express.Router()

    const tempMemory = {}

    router.get('/data/*', (req, res) => {
      if (tempMemory[req.params[0]] === undefined) {
        console.log(`DATA GET not found on ${req.params[0]}!`, tempMemory)
        return res.sendStatus(404)
      }
      console.log(`DATA GET on ${req.params[0]}!`, tempMemory)
      return res.json(tempMemory[req.params[0]])
    })

    router.put('/data/*', (req, res) => {
      const payload = req.body
      if (payload === undefined) {
        delete tempMemory[req.params[0]]
      } else {
        tempMemory[req.params[0]] = payload
      }
      console.log(`DATA PUT on ${req.params[0]}!`, tempMemory)
      return res.sendStatus(204)
    })

    router.delete('/data/*', (req, res) => {
      delete tempMemory[req.params[0]]
      console.log(`DATA DELETE on ${req.params[0]}!`, tempMemory)
      return res.sendStatus(200)
    })

    // TODO !8: use a real embedded database for persistence instead of volatile memory: https://www.npmjs.com/package/nosql

    return router
  }
}
