'use strict'

const Path = require('path')
const webpack = require('webpack')

module.exports = {
  entry: [
    './example/component.jsx',
    './lib/browser/styles.css',
    'react-gridifier/dist/styles.css'
  ],
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
        use: [
          {
            loader: 'style-loader?sourceMap'
          },
          {
            loader: 'css-loader?sourceMap'
          }
        ]
      }
    ]
  },
  plugins: [
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NamedModulesPlugin()
  ],
  devtool: 'cheap-module-source-map'
}
