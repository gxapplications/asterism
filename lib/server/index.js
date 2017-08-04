'use strict'

/* global require */
import bodyParser from 'body-parser'
import 'colors'
import EventEmitter from 'events'
import express from 'express'
import Joi from 'joi'
import Path from 'path'

import AssetsService from './assets-service'
import DataService from './data-service'
import pluginManifestSchema from './schemas/plugin-manifest'

class Server extends EventEmitter {
  constructor () {
    super()
    this.express = express()
    this.browserSettingsPanels = []
    this.browserItemFactories = []

    // auto parse requests in json format
    this.express.use(bodyParser.json())

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

    const manifestValidation = Joi.validate(pluginManifest, pluginManifestSchema)
    if (manifestValidation.error) {
      console.error('Plugin manifest malformed...'.red)
      console.error(manifestValidation.error)
      console.log('Plugin cannot be added. See error logs.'.red)
      return
    }

    console.log(`Adding plugin ${pluginManifest.name} (v${pluginManifest.version})...`.cyan)
    try {
      this._serverPlug(pluginManifest)
      this._browserPlug(pluginManifest)
    } catch (error) {
      console.error(error.message.red)
      console.log(`Plugin ${pluginManifest.name} cannot be added. See error logs.`.red)
    }
  }

  start (port, callback) {
    this.express.listen(port, () => {
      this.emit('start')
      callback()
    })
  }

  _browserPlug (pluginManifest) {
    const browserManifest = pluginManifest.browser

    if (browserManifest.settingsPanel) {
      console.log(`Adding settings panel for plugin ${pluginManifest.name}...`.grey)
      try {
        require.resolve(browserManifest.settingsPanel)
        this.browserSettingsPanels.push(browserManifest.settingsPanel)
      } catch (error) {
        console.log(`Settings panel ${pluginManifest.name} is a local one.`.grey)
        try { // If not found as a classical module, search from the current directory (dev mode)
          const path = Path.resolve(process.cwd(), '..', browserManifest.settingsPanel)
          require.resolve(path)
          this.browserSettingsPanels.push(path)
        } catch (error) {
          throw new Error(`Settings panel module ${browserManifest.settingsPanel} for plugin ${pluginManifest.name} not found!`)
        }
      }
    }

    if (browserManifest.itemFactory) {
      console.log(`Adding item factory for plugin ${pluginManifest.name}...`.grey)
      try {
        require.resolve(browserManifest.itemFactory)
        this.browserItemFactories.push(browserManifest.itemFactory)
      } catch (error) {
        console.log(`Item Factory ${pluginManifest.name} is a local one.`.grey)
        try { // If not found as a classical module, search from the current directory (dev mode)
          const path = Path.resolve(process.cwd(), '..', browserManifest.itemFactory)
          require.resolve(path)
          this.browserItemFactories.push(path)
        } catch (error) {
          throw new Error(`Item factory module ${browserManifest.itemFactory} for plugin ${pluginManifest.name} not found!`)
        }
      }
    }
  }

  _serverPlug (pluginManifest) {
    // TODO !8: ajout d'un middleware
  }
}

export default new Server()
