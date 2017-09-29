'use strict'

import BabiliPlugin from 'babili-webpack-plugin'
import ExtractTextPlugin from 'extract-text-webpack-plugin'
import Path from 'path'
import webpack from 'webpack'

const isDist = Path.basename(Path.dirname(Path.dirname(__dirname))) === 'dist'

const entriesMain = isDist
  ? [
    Path.join(__dirname, 'bootstrap.js'),
    Path.join(__dirname, '..', '..', 'styles.css')
  ]
  : [
    Path.join(__dirname, 'bootstrap.jsx'),
    Path.join(__dirname, '..', 'styles.css'),
    'react-gridifier/dist/styles.css'
  ]

const options = (server) => {
  const exposeRules = []
  const entriesPlugins = []
  for (var panel of server.browserSettingsPanels) {
    entriesPlugins.push(panel.module)
    exposeRules.push({
      test: panel.module,
      use: [{
        loader: 'expose-loader',
        options: `plugins.settingsPanels.${panel.module}`
      }]
    })
  }
  for (var factory of server.browserItemFactories) {
    entriesPlugins.push(factory.module)
    exposeRules.push({
      test: factory.module,
      use: [{
        loader: 'expose-loader',
        options: `plugins.itemFactories.${factory.module}`
      }]
    })
  }

  const entries = { bundle: entriesMain }
  if (entriesPlugins.length > 0) {
    entries.plugins = entriesPlugins
  }

  return {
    entry: entries,
    output: {
      path: Path.resolve('.', 'var', 'build'),
      filename: '[name].js',
      publicPath: '/build'
    },
    module: {
      rules: [
        ...exposeRules,
        isDist ? {} : {
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
            use: 'css-loader'
          })
        },
        {
          test: /\.scss$/,
          use: ExtractTextPlugin.extract({
            fallback: 'style-loader',
            use: ['css-loader', 'sass-loader']
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
    resolve: {
      alias: {
        'react': Path.join(__dirname, '..', '..', '..', 'node_modules', 'react') // to avoid multiple copies of react imported
      },
      extensions: ['.js', '.jsx', '.json', 'scss'],
      modules: ['node_modules', Path.resolve(process.cwd(), '..')]
    },
    plugins: [
      new ExtractTextPlugin('styles.css'),
      new webpack.DefinePlugin({
        'process.env.NODE_ENV': JSON.stringify('production'),
        'process.env.ASTERISM_SETTINGS_PANELS': JSON.stringify(server.browserSettingsPanels),
        'process.env.ASTERISM_ITEM_FACTORIES': JSON.stringify(server.browserItemFactories)
      }),
      new BabiliPlugin({}, {
        comments: false
      }),
      // new webpack.NamedModulesPlugin(), // causes plugins to crash in production mode...
      new webpack.optimize.CommonsChunkPlugin({
        name: 'common',
        minChunks: 2
      })
    ]
  }
}

export default options
