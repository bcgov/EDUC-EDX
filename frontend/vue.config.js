module.exports = {
  configureWebpack: {
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
              target: import.meta.env.VUE_APP_API_ROOT,
              changeOrigin: true,
              ws: false
            }
          }),
          {}
        ),
      }
  },
  transpileDependencies: ['vuetify', 'vue-meta'],
  publicPath: '/'
};
