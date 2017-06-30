'use strict'

import webpack from 'webpack'

const options = {
  // TODO: input=bootstrap.jsx, output=dist/bootstrap.js, penser au mode watch en dev
}

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
