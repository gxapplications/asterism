const f = function processSass (data, filename) {
  const result = require('node-sass').renderSync({
    data: data,
    file: filename
  }).css
  return result.toString('utf8')
}
module.exports = f
