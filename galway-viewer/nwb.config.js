const sassDefine = require('sass-define');
const MetalsmithPlugin = require('@fesk/plugin-metalsmith');
const ManifestPlugin = require('webpack-manifest-plugin');

module.exports = {
  type: 'react-component',
  npm: {
    esModules: false,
    cjs: process.env.NODE_ENV === 'production',
    umd:
      process.env.NODE_ENV === 'production'
        ? {
            global: 'CanvasPanel$$GalwayViewer',
          }
        : false,
  },
  webpack: {
    rules: {
      sass: {
        data: sassDefine(require('./sassConfig')),
      },
    },
    extractCSS: {
      filename: '[name].css',
    },
    publicPath: '',
    extra: {
      plugins:
        process.env.NODE_ENV === 'production'
          ? []
          : [
              new MetalsmithPlugin({ config: 'micro-site' }),
              new ManifestPlugin({
                filter: ({ path }) => path.endsWith('.map') === false,
              }),
            ],
    },
  },
  babel: {
    presets: ['react'],
    env: {
      targets: {
        browsers: ['last 2 versions', 'ie 9', 'ie 10', 'ie 11'],
      },
    },
  },
};
