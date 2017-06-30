'use strict'

import EventEmitter from 'events'
import express from 'express'

const app = express()
app.get('/', function (req, res) {
    res.send('Hello World!')
    // TODO !2: route de base pour avoir l'index HTML. utiliser express.static() ?
})

class Server extends EventEmitter {
    use () {
        // TODO !3: ajout d'un module asterism
    }

    start(port, callback) {
        app.listen(port, () => {
            this.emit('start')
            callback()
        })
    }
}

export default new Server()
