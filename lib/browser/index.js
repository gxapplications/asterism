'use strict'

import webpack from 'webpack'

class BrowserPack {
    constructor () {}

    pack () {
        console.log('browser will pack') // TODO !1: webpack dynamique, penser au mode watch en dev
        // TODO: input=bootstrap.jsx, output=build/bundle.js
        // TODO: input=bootstrap.jsx, output=build/styles.css pour les CSS (extraction, comment on fait ?)

        const options = {
        }

        /*
         webpack(options, function (err, _stats) {
         if (err) {
         // TODO
         }

         // const stats = _stats.toJson()

         if (_stats.hasErrors()) {
         // TODO
         }
         if (options.watch && _stats.hasWarnings()) {
         // TODO
         }
         })
         */
    }
}

export default new BrowserPack()
