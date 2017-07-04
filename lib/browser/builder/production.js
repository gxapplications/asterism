'use strict'

import BabiliPlugin from 'babili-webpack-plugin'
import ExtractTextPlugin from 'extract-text-webpack-plugin'
import Path from 'path'
import webpack from 'webpack'

const isDist = Path.basename(Path.dirname(Path.dirname(__dirname))) === 'dist'

const options = {
  entry: [
    Path.join(__dirname, isDist ? 'bootstrap.js' : 'bootstrap.jsx'),
    Path.join(__dirname, '..', 'styles.css'),
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
        use: [{
          loader: 'babel-loader',
          options: {
            cacheDirectory: true
          }
        }]
      },
      {
        test: /\.css$/,
        use: ExtractTextPlugin.extract({
          fallback: 'style-loader',
          use: [
            'css-loader'
          ]
        })
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
    new ExtractTextPlugin('styles.css'),
    new webpack.DefinePlugin({
      'process.env': {
        'NODE_ENV': JSON.stringify('production')
      }
    }),
    new BabiliPlugin({}, {
      comments: false
    })
  ]
}

export default options
