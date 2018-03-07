module.exports = {
  type: 'web-app',
  webpack: {
    uglify: false,
    extra: {
      resolve: {
        alias: {
          '@material/slider': '@material/slider/dist/mdc.slider',
        }
      }
    },
    rules: {
      postcss: {
        plugins: [
          require('precss'),
          require('autoprefixer'),
          require('cssnano')
        ]
      }
    }
  },
  babel: {
    env: {
      targets: {
        browsers: ['last 2 versions', 'ie 9', 'ie 10', 'ie 11'],
        useBuiltIns: 'entry',
      },
    },
  },
};
