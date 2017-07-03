'use strict'

import EventEmitter from 'events'
import express from 'express'
import Path from 'path'

class Server extends EventEmitter {
  constructor () {
    super()
    this.express = express()
    this.express.use(
      '/',
      express.static(Path.join(__dirname, '..', '..', 'assets', process.env.NODE_ENV || 'development'))
    )

    if (process.env.NODE_ENV === 'production') {
      this.express.use(
        '/build/',
        express.static(Path.resolve('.', 'var', 'build'))
      )
    }

    this.express.use(
      '/jquery/',
      express.static(Path.resolve('.', 'node_modules', 'jquery', 'dist'))
    )
    this.express.use(
      '/materialize-css/',
      express.static(Path.resolve('.', 'node_modules', 'materialize-css', 'dist'))
    )
  }
  use () {
    // TODO !3: ajout d'un module asterism
  }

  start (port, callback) {
    this.express.listen(port, () => {
      this.emit('start')
      callback()
    })
  }
}

export default new Server()
