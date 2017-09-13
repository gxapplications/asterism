'use strict'

/* global require */
import bodyParser from 'body-parser'
import 'colors'
import EventEmitter from 'events'
import express from 'express'
import Joi from 'joi'
import Path from 'path'
import sha1 from 'sha1'

import AssetsService from './assets-service'
import DataService from './data-service'
import Logger from './logger'
import pluginManifestSchema from './schemas/plugin-manifest'
import SocketService from './socket-service'

class Server extends EventEmitter {
  constructor () {
    super()
    this.express = express()
    this.middlewares = []
    this.serverPrivateSockets = []
    this.serverPublicSockets = []
    this.browserSettingsPanels = []
    this.browserItemFactories = []

    // auto parse requests in json format
    this.express.use(bodyParser.json())

    console.log('Mounting socket service...'.grey)
    this.socketService = new SocketService()

    console.log('Mounting event logger service...'.grey)
    this.logger = new Logger(this.socketService)

    console.log('Adding assets service middleware...'.grey)
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
    const server = this.express.listen(port, () => {
      this.emit('start')
      callback()
    })

    console.log('Connecting socket service...'.cyan)
    this.socketService.connect(server)

    console.log('Connecting middlewares...'.cyan)
    this.middlewares.forEach((middleware) => {
      if (middleware.connect) {
        middleware.connect()
      }
    })
  }

  _serverPlug (pluginManifest) {
    const middlewaresManifest = pluginManifest.server.middlewares
    const publicSockets = pluginManifest.server.publicSockets
    const context = { logger: this.logger.createSubLogger(pluginManifest.name) }

    if (pluginManifest.privateSocket) {
      const socketNamespace = sha1(pluginManifest.name)
      this.socketService.registerPrivateSocketToContext(socketNamespace, context)
      this.serverPrivateSockets.push(socketNamespace)
    }

    if (publicSockets && publicSockets.length > 0) {
      publicSockets.forEach((socketNamespace) => {
        this.socketService.registerPublicSocketToContext(socketNamespace, context)
        this.serverPublicSockets.push(socketNamespace)
      })
    }

    if (middlewaresManifest) {
      middlewaresManifest(context).forEach((middlewarePath) => {
        console.log(`Adding server middleware for plugin ${pluginManifest.name}...`.grey)
        try {
          let middleware = require(middlewarePath)
          middleware = middleware.default ? middleware.default : middleware(context)
          this.express.use(middleware)
          this.middlewares.push(middleware)
        } catch (error) {
          console.log(`Server middleware for plugin ${pluginManifest.name} is a local one.`.grey)
          try { // If not found as a classical module, search from the current directory (dev mode)
            const path = Path.resolve(process.cwd(), '..', middlewarePath)
            let middleware = require(path)
            middleware = middleware.default ? middleware.default(context) : middleware(context)
            this.express.use(middleware)
            this.middlewares.push(middleware)
          } catch (error) {
            throw new Error(`Server middleware module ${middlewarePath} for plugin ${pluginManifest.name} not found!`)
          }
        }
      })
    }
  }

  _browserPlug (pluginManifest) {
    const browserManifest = pluginManifest.browser
    const pluginSha1 = sha1(pluginManifest.name)
    const publicSockets = (browserManifest.publicSockets || [])

    if (browserManifest.settingsPanel) {
      console.log(`Adding settings panel for plugin ${pluginManifest.name}...`.grey)
      try {
        require.resolve(browserManifest.settingsPanel)
        this.browserSettingsPanels.push({
          module: browserManifest.settingsPanel,
          privateSocket: this.serverPrivateSockets.includes(pluginSha1) ? pluginSha1 : null,
          publicSockets
        })
      } catch (error) {
        console.log(`Settings panel ${pluginManifest.name} is a local one.`.grey)
        try { // If not found as a classical module, search from the current directory (dev mode)
          const path = Path.resolve(process.cwd(), '..', browserManifest.settingsPanel)
          require.resolve(path)
          this.browserSettingsPanels.push({
            module: path,
            privateSocket: this.serverPrivateSockets.includes(pluginSha1) ? pluginSha1 : null,
            publicSockets
          })
        } catch (error) {
          throw new Error(`Settings panel module ${browserManifest.settingsPanel} for plugin ${pluginManifest.name} not found!`)
        }
      }
    }

    if (browserManifest.itemFactory) {
      console.log(`Adding item factory for plugin ${pluginManifest.name}...`.grey)
      try {
        require.resolve(browserManifest.itemFactory)
        this.browserItemFactories.push({
          module: browserManifest.itemFactory,
          privateSocket: this.serverPrivateSockets.includes(pluginSha1) ? pluginSha1 : null,
          publicSockets
        })
      } catch (error) {
        console.log(`Item Factory ${pluginManifest.name} is a local one.`.grey)
        try { // If not found as a classical module, search from the current directory (dev mode)
          const path = Path.resolve(process.cwd(), '..', browserManifest.itemFactory)
          require.resolve(path)
          this.browserItemFactories.push({
            module: path,
            privateSocket: this.serverPrivateSockets.includes(pluginSha1) ? pluginSha1 : null,
            publicSockets
          })
        } catch (error) {
          throw new Error(`Item factory module ${browserManifest.itemFactory} for plugin ${pluginManifest.name} not found!`)
        }
      }
    }

    if (this.serverPrivateSockets.includes(pluginSha1)) {
      console.log(`Plugin ${pluginManifest.name} registered a private socket.`.grey)
    }
    if (publicSockets && publicSockets.length > 0) {
      console.log(`Plugin ${pluginManifest.name} registered public sockets to join.`.grey)
    }
  }
}

export default new Server()
