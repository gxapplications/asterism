'use strict'

const Path = require('path')
import webpack from 'webpack'

const isDist = Path.basename(Path.dirname(Path.dirname(__dirname))) === 'dist'

const entries = isDist
  ? [
    Path.join(__dirname, 'bootstrap.js'),
    Path.join(__dirname, '..', '..', 'styles.css')
  ]
  : [
    Path.join(__dirname, 'bootstrap.jsx'),
    Path.join(__dirname, '..', 'styles.css'),
    'react-gridifier/dist/styles.css'
  ]

const options = {
  entry: entries,
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
  resolve: {
    extensions: ['.js', '.jsx', '.json']
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development')
    }),
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
