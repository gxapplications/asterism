'use strict'

import 'colors'
import EventEmitter from 'events'
import express from 'express'

import AssetsService from './assets-service'
import DataService from './data-service'

class Server extends EventEmitter {
  constructor () {
    super()
    this.express = express()

    console.log('Adding assets service middlewares...'.grey)
    this.assetsService = new AssetsService()
    Object.entries(this.assetsService.middlewares()).forEach((middleware) => this.express.use(...middleware))

    console.log('Adding data service routes...'.grey)
    this.dataService = new DataService()
    this.express.use(this.dataService.router())
  }

  use (pluginManifest) {
    if (!pluginManifest.name && pluginManifest.default && pluginManifest.default.name) {
      pluginManifest = pluginManifest.default
    }

    if (!pluginManifest.name) {
      console.error('Plugin manifest malformed...'.red)
    }

    console.log(`Adding plugin ${pluginManifest.name}...`.grey)
    // TODO !0: ajout d'un module asterism
  }

  start (port, callback) {
    this.express.listen(port, () => {
      this.emit('start')
      callback()
    })
  }
}

export default new Server()
