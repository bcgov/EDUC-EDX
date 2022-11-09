//const path = require('path');
const webpack = require('webpack');

module.exports = {
  configureWebpack: {
    plugins: [
      new webpack.DefinePlugin({
        global: 'window' // Placeholder for global used in any node_modules
      })
    ],
    module: {
      rules: [
        {
          test: /config.*config\.js$/,
          use: [
            {
              loader: 'file-loader',
              options: {
                name: '/js/config/config.js'
              },
            },
            {
              loader: 'file-loader',
              options: {
                name: '/js/snowplow.js'
              }
            }
          ]
        }
      ]
    },
    performance: {
      hints: false
    },
    optimization: {
      splitChunks: {
        minSize: 10000,
        maxSize: 250000
      }
    }
  },
  devServer: {
    proxy:
      {
        ...['/api'].reduce(
          (acc, ctx) => ({
            ...acc,
            [ctx]: {
              target: process.env.VUE_APP_API_ROOT,
              changeOrigin: true,
              ws: false
            }
          }),
          {}
        ),
      }
  },
  transpileDependencies: ['vuetify'],
  publicPath: '/'
};
