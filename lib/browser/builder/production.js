'use strict'

/* global process, JSON */
import MiniCssExtractPlugin from 'mini-css-extract-plugin'
import Path from 'path'
import webpack from 'webpack'

const isDist = Path.basename(Path.dirname(Path.dirname(__dirname))) === 'dist'

const entriesMain = isDist
  ? [
    Path.join(__dirname, 'bootstrap.js'),
    Path.join(__dirname, '..', '..', 'styles/asterism.css'),
    Path.join(__dirname, '..', '..', 'styles/styles.css'),
    'react-gridifier/dist/styles.css',
    'asterism-plugin-library/dist/styles.css'
  ]
  : [
    Path.join(__dirname, 'bootstrap.jsx'),
    Path.join(__dirname, '..', 'asterism.css'),
    Path.join(__dirname, '..', 'styles.css'),
    'react-gridifier/dist/styles.css',
    'asterism-plugin-library/dist/styles.css'
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
    entriesMain.push(styles)
  }

  const entries = { bundle: entriesMain }
  if (entriesPlugins.length > 0) {
    entries.plugins = entriesPlugins
  }

  const excludeMask = (server.browserWebpackIncludeMask.length)
    ? new RegExp(`node_modules/(?!${server.browserWebpackIncludeMask.join('|')})`)
    : /node_modules/

  return {
    mode: 'production',
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
          use: [
            MiniCssExtractPlugin.loader,
            {
              loader: 'css-loader',
              options: {
                url: false
              }
            }
          ]
        },
        {
          test: /\.(sass|scss)$/,
          use: [
            MiniCssExtractPlugin.loader,
            {
              loader: 'css-loader',
              options: {
                url: false
              }
            },
            'sass-loader'
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
        // joi: 'joi-browser',
        '@hapi/joi': 'joi-browser',
        react: Path.join(process.cwd(), 'node_modules', 'react') // to avoid multiple copies of react imported
      },
      extensions: ['.js', '.jsx', '.json', 'scss'],
      modules: ['node_modules', Path.resolve(process.cwd(), '..')],
      symlinks: false
    },
    plugins: [
      new MiniCssExtractPlugin({
        filename: 'styles.css'
      }),
      new webpack.DefinePlugin({
        'process.env.NODE_ENV': JSON.stringify('production'),
        'process.env.ASTERISM_SETTINGS_PANELS': JSON.stringify(server.browserSettingsPanels),
        'process.env.ASTERISM_SERVICES': JSON.stringify(server.browserServices),
        'process.env.ASTERISM_EDIT_PANELS': JSON.stringify(server.browserEditPanels),
        'process.env.ASTERISM_ITEM_FACTORIES': JSON.stringify(server.browserItemFactories),
        'process.env.ASTERISM_WEB_PUSH_PARAMS': JSON.stringify(webPushParams)
      }),
      new webpack.optimize.SplitChunksPlugin({
        cacheGroups: {
          shared: {
            test: excludeMask,
            minChunks: 2,
            name: 'common',
            enforce: true
          }
        }
      })
    ]
  }
}

export default options
