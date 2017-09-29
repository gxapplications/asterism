'use strict'

import Path from 'path'
import webpack from 'webpack'

const isDist = Path.basename(Path.dirname(Path.dirname(__dirname))) === 'dist'

const entriesMain = isDist
  ? [
    'react-hot-loader/patch',
    Path.join(__dirname, 'bootstrap.js'),
    Path.join(__dirname, '..', '..', 'styles.css'),
    'webpack-hot-middleware/client?reload=true'
  ]
  : [
    'react-hot-loader/patch',
    Path.join(__dirname, 'bootstrap.jsx'),
    Path.join(__dirname, '..', 'styles.css'),
    'react-gridifier/dist/styles.css',
    'webpack-hot-middleware/client?reload=true'
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
        {
          test: /\.jsx?$/,
          exclude: /node_modules/,
          use: [
            'react-hot-loader/webpack',
            {
              loader: 'babel-loader',
              options: {
                cacheDirectory: true
              }
            }
          ]
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
          test: /\.scss$/,
          use: [
            {
              loader: 'style-loader?sourceMap'
            },
            {
              loader: 'css-loader?sourceMap'
            },
            {
              loader: 'sass-loader?sourceMap'
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
      alias: {
        'react': Path.join(__dirname, '..', '..', '..', 'node_modules', 'react') // to avoid multiple copies of react imported
      },
      extensions: ['.js', '.jsx', '.json'],
      modules: ['node_modules', Path.resolve(process.cwd(), '..')]
    },
    plugins: [
      new webpack.DefinePlugin({
        'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development'),
        'process.env.ASTERISM_SETTINGS_PANELS': JSON.stringify(server.browserSettingsPanels),
        'process.env.ASTERISM_ITEM_FACTORIES': JSON.stringify(server.browserItemFactories)
      }),
      new webpack.NamedModulesPlugin(),
      new webpack.optimize.CommonsChunkPlugin({
        name: 'common',
        minChunks: 2
      }),
      new webpack.HotModuleReplacementPlugin()
    ],
    devtool: 'cheap-module-source-map',
    devServer: {
      hot: true,
      contentBase: Path.resolve('.', 'var', 'build'),
      publicPath: '/build',
      stats: 'errors-only',
      overlay: {
        warnings: true,
        errors: true
      },
      historyApiFallback: true,
      watchContentBase: true,
      watchOptions: {
        aggregateTimeout: 400,
        ignored: /node_modules/
      }
      // TODO !5: https: { key, cert, ca } // https://webpack.js.org/configuration/dev-server/#devserver-https
    }
  }
}

export default options
