'use strict'

const Path = require('path')
import webpack from 'webpack'

const options = {
  entry: [
    './lib/browser/builder/bootstrap.jsx', // TODO !0: en contexte distrib as a lib, fixer ce chemin!
    './lib/browser/styles.css', // TODO !0: en contexte distrib as a lib, fixer ce chemin!
    'react-gridifier/dist/styles.css'
  ],
  output: {
    path: Path.resolve('.', 'var', 'build'),
    filename: 'bundle.js',
    publicPath: '/build'
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
      },
      {
        test: /\.(png|svg|jpe?g|gif)$/,
        use: [
          'file-loader?name=images/[name].[ext]'
        ]
      },
      {
        test: /\.(woff|woff2|eot|ttf|otf)$/,
        use: [
          'file-loader?name=fonts/[name].[ext]'
        ]
      }
    ]
  },
  plugins: [
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NamedModulesPlugin()
  ],
  devtool: 'cheap-module-source-map',
  devServer: {
    hot: true,
    contentBase: Path.resolve('.', 'var', 'build'),
    publicPath: '/build'
  }
}

export default options
