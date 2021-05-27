'use strict'

/* global process, JSON */
import Path from 'path'
import webpack from 'webpack'

const isDist = Path.basename(Path.dirname(Path.dirname(__dirname))) === 'dist'

const entriesMain = isDist
  ? [
    'react-hot-loader/patch',
    Path.join(__dirname, 'bootstrap.js'),
    Path.join(__dirname, '..', '..', 'styles/asterism.css'),
    Path.join(__dirname, '..', '..', 'styles/styles.css'),
    'react-gridifier/dist/styles.css',
    'asterism-plugin-library/dist/styles.css',
    'webpack-hot-middleware/client?reload=true'
  ]
  : [
    'react-hot-loader/patch',
    Path.join(__dirname, 'bootstrap.jsx'),
    Path.join(__dirname, '..', 'asterism.css'),
    'react-gridifier/dist/styles.css',
    'asterism-plugin-library/dist/styles.css',
    'webpack-hot-middleware/client?reload=true'
  ]

const options = (server, webPushParams = {}) => {
  const exposeRules = []
  const entriesPlugins = []

  for (var service of server.browserServices) {
    if (!service) {
      continue
    }
    entriesPlugins.push(service.service)
    exposeRules.push({
      test: service.service,
      use: [{
        loader: 'expose-loader',
        options: { exposes: { globalName: `plugins.services.${service.service}`, override: true } }
      }]
    })
  }

  for (var panel of server.browserSettingsPanels) {
    entriesPlugins.push(panel.module)
    exposeRules.push({
      test: panel.module,
      use: [{
        loader: 'expose-loader',
        options: { exposes: { globalName: `plugins.settingsPanels.${panel.module}`, override: true } }
      }]
    })
  }

  for (var editPanel of server.browserEditPanels) {
    entriesPlugins.push(editPanel.module)
    exposeRules.push({
      test: editPanel.module,
      use: [{
        loader: 'expose-loader',
        options: { exposes: { globalName: `plugins.editPanels.${editPanel.module}`, override: true } }
      }]
    })
  }

  for (var factory of server.browserItemFactories) {
    entriesPlugins.push(factory.module)
    exposeRules.push({
      test: factory.module,
      use: [{
        loader: 'expose-loader',
        options: { exposes: { globalName: `plugins.itemFactories.${factory.module}`, override: true } }
      }]
    })
  }

  for (var styles of server.browserStyles) {
    entriesPlugins.push(styles)
  }

  const entries = { bundle: entriesMain }
  if (entriesPlugins.length > 0) {
    entries.plugins = entriesPlugins
  }

  const excludeMask = (server.browserWebpackIncludeMask.length)
    ? new RegExp(`node_modules/(?!${server.browserWebpackIncludeMask.join('|')})`)
    : /node_modules/

  return {
    mode: 'development',
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
          exclude: excludeMask,
          use: [
            'react-hot-loader/webpack',
            {
              loader: 'babel-loader',
              options: {
                extends: Path.join(__dirname, '..', '..', '..', '.babelrc'),
                cacheDirectory: true
              }
            }
          ]
        },
        {
          test: /\.css$/,
          use: [
            'style-loader',
            {
              loader: 'css-loader',
              options: {
                url: false,
                sourceMap: true
              }
            }
          ]
        },
        {
          test: /\.(sass|scss)$/,
          use: [
            'style-loader',
            {
              loader: 'css-loader',
              options: {
                url: false,
                sourceMap: true
              }
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
        // joi: Path.join(process.cwd(), 'node_modules', 'joi'), // to avoid multiple copies of joi imported
        react: Path.join(process.cwd(), 'node_modules', 'react') // to avoid multiple copies of react imported
      },
      extensions: ['.js', '.jsx', '.json', '.sass', '.scss'],
      modules: ['node_modules', Path.resolve(process.cwd(), '..')],
      symlinks: false
    },
    plugins: [
      new webpack.DefinePlugin({
        'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development'),
        'process.env.ASTERISM_SETTINGS_PANELS': JSON.stringify(server.browserSettingsPanels),
        'process.env.ASTERISM_SERVICES': JSON.stringify(server.browserServices),
        'process.env.ASTERISM_EDIT_PANELS': JSON.stringify(server.browserEditPanels),
        'process.env.ASTERISM_ITEM_FACTORIES': JSON.stringify(server.browserItemFactories),
        'process.env.ASTERISM_WEB_PUSH_PARAMS': JSON.stringify(webPushParams)
      }),
      new webpack.NamedModulesPlugin(),
      new webpack.optimize.SplitChunksPlugin({
        minChunks: 2,
        cacheGroups: {
          shared: {
            test: excludeMask,
            name: 'common',
            enforce: true
          }
        }
      }),
      new webpack.HotModuleReplacementPlugin()
    ],
    devtool: 'cheap-module-source-map',
    devServer: {
      // hot: true,
      contentBase: Path.resolve('.', 'var', 'build'),
      publicPath: '/build',
      stats: 'errors-only',
      logLevel: 'warn',
      // historyApiFallback: true,
      // watchContentBase: true,
      watchOptions: {
        aggregateTimeout: 400,
        ignored: excludeMask
      }
    }
  }
}

export default options
