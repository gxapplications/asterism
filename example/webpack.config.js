'use strict'

const Path = require('path')

// TODO !0: ajouter l'écoute et le build des CSS, vers /build/styles.css
module.exports = {
  entry: './example/component.jsx',
  output: {
    path: Path.join(__dirname, 'build'),
    filename: 'bundle.js',
    publicPath: '/example/build'
  },
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        include: Path.join(__dirname, '..'),
        use: [{
          loader: 'babel-loader',
          options: {
            cacheDirectory: true
          }
        }]
      },
      {
        test: /\.css$/,
        exclude: /node_modules/,
        include: Path.join(__dirname, '..'),
        use: [
          {
            loader: 'style-loader'
          },
          {
            loader: 'css-loader'
          }
        ]
      }
    ]
  },
  resolve: {
    extensions: ['.js', '.jsx', '.json']
  },
  devtool: 'cheap-module-source-map'
}
