'use strict'

/* global require, process */
import bodyParser from 'body-parser'
import 'colors'
import EventEmitter from 'events'
import express from 'express'
import fs from 'fs'
import https from 'https'
import { IpFilter } from 'express-ipfilter'
import Joi from 'joi'
import Path from 'path'
import sha1 from 'sha1'
import tsort from 'tsort'

import AssetsService from './assets-service'
import DataHandler from './data-handler'
import DataService from './data-service'
import Logger from './logger'
import NotificationService from './notification-service'
import pluginManifestSchema from './schemas/plugin-manifest'
import SocketService from './socket-service'
import WebAppService from './web-app-service'
import { version } from '../../package.json'

class Server extends EventEmitter {
  constructor () {
    super()
    console.log(`Asterism booting... (${version})`.cyan)

    this.express = express()
    this.middlewares = []
    this.pluginServices = []
    this.serverPrivateSockets = []
    this.serverPublicSockets = []
    this.browserSettingsPanels = []
    this.browserEditPanels = []
    this.browserItemFactories = []
    this.browserStyles = []
    this.browserWebpackIncludeMask = []
    this.browserServices = []

    // auto parse requests in json format
    this.express.use(bodyParser.json())

    console.log('Mounting notification & socket services...'.grey)
    this.notificationService = new NotificationService()
    this.socketService = new SocketService(this.notificationService)

    console.log('Mounting event logger service...'.grey)
    this.logger = new Logger(this.socketService)

    console.log('Adding assets service middleware...'.grey)
    this.assetsService = new AssetsService()
    Object.entries(this.assetsService.middlewares()).forEach((middleware) => this.express.use(...middleware))

    console.log('Adding data service routes...'.grey)
    this.dataHandler = new DataHandler('asterism', this.logger)
    this.dataService = new DataService(this.dataHandler)
    this.express.use(this.dataService.router())

    console.log('Adding Web App service routes...'.grey)
    this.webAppService = new WebAppService()
    this.express.use(this.webAppService.router())
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
      if (pluginManifest.libName) { // FIXME: I have a doubt about use of this... for dev env only
        this.browserWebpackIncludeMask.push(pluginManifest.libName)
      }
    } catch (error) {
      console.error(error.message.red)
      console.log(`Plugin ${pluginManifest.name} cannot be added. See error logs.`.red)
    }
  }

  start (portOffset, ipWhiteList, callback) {
    if (!this._sortByDependencies()) {
      return
    }

    this.express.use(IpFilter(ipWhiteList, {mode: 'allow'}))

    let server = null

    if (fs.existsSync(Path.join('.', 'var', 'asterism.pem'))) {
      const httpOptions = {
        key: fs.readFileSync(Path.join('.', 'var', 'asterism.key')),
        cert: fs.readFileSync(Path.join('.', 'var', 'asterism.pem')),
        ca: fs.readFileSync(Path.join('.', 'var', 'rootCA.pem'))
      }

      // HTTP server to redirect to HTTPS main server
      const redirectServer = express()
      const httpsPort = (portOffset === 0) ? '' : `:${portOffset + 443}`
      redirectServer.all('*', (req, res) => {
        res.redirect(`https://${req.hostname}${httpsPort}` + req.url)
      })
      redirectServer.listen(portOffset + 80, () => {
        console.log(`HTTP redirecting Express server ready on port ${portOffset + 80}.`.grey)
      })

      // HTTPS main server
      server = https.createServer(httpOptions, this.express).listen(portOffset + 443, () => {
        this.emit('start', callback)
        console.log(`HTTPS secured Express server ready on port ${portOffset + 443}. Waiting for webpack to finish...`.grey)
      })
    } else {
      console.log(`No SSL certificate found, HTTPS will not be not available! run 'HOST=<server-hostname> npm run gen:cert' to fix this.`.red)

      // HTTP main server
      server = this.express.listen(portOffset + 80, () => {
        this.emit('start', callback)
        console.log(`HTTP Express server ready on port ${portOffset + 80}. Waiting for webpack to finish...`.grey)
      })
    }

    console.log('Connecting socket service...'.cyan)
    this.socketService.connect(server)

    console.log('Connecting middlewares...'.cyan)
    this.middlewares.forEach((middleware) => {
      if (middleware.connectPlugin) {
        const contextualizablePluginService = middleware.connectPlugin(() => this.pluginServices)
        if (contextualizablePluginService) {
          this.pluginServices[middleware.libName] = contextualizablePluginService
        }
      }
    })

    console.log('Adding fallback route...'.grey)
    this.express.use(this.assetsService.fallback())
  }

  stop (callback = () => {}, msg = null) {
    // TODO !6: send kill signal to dataHandler/sockets/services

    console.log('Disconnecting middlewares...'.cyan)
    this.middlewares.forEach((middleware) => {
      if (middleware.disconnectPlugin) {
        middleware.disconnectPlugin()
      }
    })

    // msg can be sent to indicate stop reason to the browser.
    console.log(`Express server stopped: ${msg}`.cyan)
    callback()
  }

  _serverPlug (pluginManifest) {
    const middlewaresManifest = pluginManifest.server.middlewares
    const publicSockets = pluginManifest.server.publicSockets
    const context = {
      logger: this.logger.createSubLogger(pluginManifest.libName),
      dataHandler: this.dataHandler.createSubStorage(pluginManifest.libName),
      notificationHandler: this.notificationService.createHandler(pluginManifest.libName)
    }

    if (pluginManifest.privateSocket) {
      const socketNamespace = sha1(pluginManifest.libName)
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
          middleware = middleware.default ? middleware.default(context, express.Router()) : middleware(context, express.Router())
          this.express.use(`/${pluginManifest.libName}`, middleware)
          middleware.libName = pluginManifest.libName
          Object.freeze(middleware.libName) // Protect against hacks.
          this.middlewares.push(middleware)
        } catch (error) {
          console.log(`Server middleware for plugin ${pluginManifest.name} is a local one.`.grey)
          try { // If not found as a classical module, search from the current directory (dev mode)
            const path = Path.resolve(process.cwd(), '..', middlewarePath)
            let middleware = require(path)
            middleware = middleware.default ? middleware.default(context, express.Router()) : middleware(context, express.Router())
            this.express.use(`/${pluginManifest.libName}`, middleware)
            middleware.libName = pluginManifest.libName
            Object.freeze(middleware.libName) // Protect against hacks.
            this.middlewares.push(middleware)
          } catch (error) {
            console.error(error)
            throw new Error(`Server middleware module ${middlewarePath} for plugin ${pluginManifest.name} not found!`)
          }
        }
      })
    }
  }

  _browserPlug (pluginManifest) {
    const browserManifest = pluginManifest.browser
    const servicesManifest = browserManifest.services
    const pluginSha1 = sha1(pluginManifest.libName)
    const publicSockets = browserManifest.publicSockets || []
    const dependencies = pluginManifest.dependencies || []

    const context = {} // FIXME: no context for now. See when needed...

    if (servicesManifest) {
      servicesManifest(context).forEach((servicePath) => {
        console.log(`Adding browser service for plugin ${pluginManifest.name}...`.grey)
        try {
          require.resolve(servicePath)
          this.browserServices.push({
            libName: pluginManifest.libName,
            service: Path.resolve(process.cwd(), 'node_modules', servicePath),
            privateSocket: this.serverPrivateSockets.includes(pluginSha1) ? pluginSha1 : null,
            publicSockets,
            dependencies
          })
        } catch (error) {
          console.log(`Browser service for plugin ${pluginManifest.name} is a local one.`.grey)
          try { // If not found as a classical module, search from the current directory (dev mode)
            const path = Path.resolve(process.cwd(), '..', servicePath)
            require.resolve(path)
            this.browserServices.push({
              libName: pluginManifest.libName,
              service: path,
              privateSocket: this.serverPrivateSockets.includes(pluginSha1) ? pluginSha1 : null,
              publicSockets,
              dependencies
            })
          } catch (error) {
            throw new Error(`Browser service ${servicePath} for plugin ${pluginManifest.name} not found!`)
          }
        }
      })
    }

    if (browserManifest.settingsPanel) {
      console.log(`Adding settings panel for plugin ${pluginManifest.name}...`.grey)
      try {
        require.resolve(browserManifest.settingsPanel)
        this.browserSettingsPanels.push({
          libName: pluginManifest.libName,
          module: Path.resolve(process.cwd(), 'node_modules', browserManifest.settingsPanel),
          privateSocket: this.serverPrivateSockets.includes(pluginSha1) ? pluginSha1 : null,
          publicSockets
        })
      } catch (error) {
        console.log(`Settings panel ${pluginManifest.name} is a local one.`.grey)
        try { // If not found as a classical module, search from the current directory (dev mode)
          const path = Path.resolve(process.cwd(), '..', browserManifest.settingsPanel)
          require.resolve(path)
          this.browserSettingsPanels.push({
            libName: pluginManifest.libName,
            module: path,
            privateSocket: this.serverPrivateSockets.includes(pluginSha1) ? pluginSha1 : null,
            publicSockets
          })
        } catch (error) {
          throw new Error(`Settings panel module ${browserManifest.settingsPanel} for plugin ${pluginManifest.name} not found!`)
        }
      }
    }

    if (browserManifest.editPanels) {
      console.log(`Adding edit panels for plugin ${pluginManifest.name}...`.grey)
      browserManifest.editPanels.forEach((editPanel) => {
        try {
          require.resolve(editPanel)
          this.browserEditPanels.push({
            libName: pluginManifest.libName,
            module: Path.resolve(process.cwd(), 'node_modules', editPanel),
            privateSocket: this.serverPrivateSockets.includes(pluginSha1) ? pluginSha1 : null,
            publicSockets
          })
        } catch (error) {
          console.log(`Edit panel ${editPanel} for plugin ${pluginManifest.name} is a local one.`.grey)
          try { // If not found as a classical module, search from the current directory (dev mode)
            const path = Path.resolve(process.cwd(), '..', editPanel)
            require.resolve(path)
            this.browserEditPanels.push({
              libName: pluginManifest.libName,
              module: path,
              privateSocket: this.serverPrivateSockets.includes(pluginSha1) ? pluginSha1 : null,
              publicSockets
            })
          } catch (error) {
            throw new Error(`Edit panel module ${editPanel} for plugin ${pluginManifest.name} not found!`)
          }
        }
      })
    }

    if (browserManifest.itemFactory) {
      console.log(`Adding item factory for plugin ${pluginManifest.name}...`.grey)
      try {
        require.resolve(browserManifest.itemFactory)
        this.browserItemFactories.push({
          libName: pluginManifest.libName,
          module: Path.resolve(process.cwd(), 'node_modules', browserManifest.itemFactory),
          privateSocket: this.serverPrivateSockets.includes(pluginSha1) ? pluginSha1 : null,
          publicSockets
        })
      } catch (error) {
        console.log(`Item Factory ${pluginManifest.name} is a local one.`.grey)
        try { // If not found as a classical module, search from the current directory (dev mode)
          const path = Path.resolve(process.cwd(), '..', browserManifest.itemFactory)
          require.resolve(path)
          this.browserItemFactories.push({
            libName: pluginManifest.libName,
            module: path,
            privateSocket: this.serverPrivateSockets.includes(pluginSha1) ? pluginSha1 : null,
            publicSockets
          })
        } catch (error) {
          throw new Error(`Item factory module ${browserManifest.itemFactory} for plugin ${pluginManifest.name} not found!`)
        }
      }
    }

    if (browserManifest.styles) {
      console.log(`Adding styles for plugin ${pluginManifest.name}...`.grey)
      try {
        require.resolve(browserManifest.styles)
        this.browserStyles.push(Path.resolve(process.cwd(), 'node_modules', browserManifest.styles))
      } catch (error) {
        console.log(`Styles file for ${pluginManifest.name} is a local one.`.grey)
        try { // If not found as a classical module, search from the current directory (dev mode)
          const path = Path.resolve(process.cwd(), '..', browserManifest.styles)
          require.resolve(path)
          this.browserStyles.push(path)
        } catch (error) {
          throw new Error(`Styles file ${browserManifest.styles} for plugin ${pluginManifest.name} not found!`)
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

  _sortByDependencies () {
    // We use topological sort (we have a graph, with potential cyclic deps...)

    // browser services
    const browserServicesSorter = tsort()
    this.browserServices.forEach((browserService) => {
      browserServicesSorter.add(browserService.libName)
      browserService.dependencies.forEach((dependency) => {
        browserServicesSorter.add(dependency, browserService.libName)
      })
    })
    try {
      const sorted = browserServicesSorter.sort()
      for (var i = 0; i < sorted.length; i++) {
        sorted[i] = this.browserServices.find((s) => s.libName === sorted[i])
      }
      this.browserServices = sorted
    } catch (error) {
      console.error(error.message.red)
      console.log(`Cannot sort registered services: cyclic dependencies are detected. See error logs.`.red)
      return false
    }

    // FIXME: others to sort also?

    return true
  }
}

export default new Server()
