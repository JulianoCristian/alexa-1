const path = require('path');
const ModuleScopePlugin = require('react-dev-utils/ModuleScopePlugin');
const eslintFormatter = require('react-dev-utils/eslintFormatter');
const webpack = require('webpack');
const paths = require('../src/paths');
const getEnvironment = require('../src/env');

const env = getEnvironment();

module.exports = {
  // Don't attempt to continue if there are any errors.
  bail: true,
  // We generate sourcemaps in production. This is slow but gives good results.
  // You can exclude the *.map files from the build during deployment.
  devtool: 'source-map',
  // In production, we only want to load the polyfills and the app code.
  entry: [require.resolve('babel-polyfill'), paths.appMain],

  target: 'node',

  // The build folder
  output: {
    path: paths.appBuildDirectory,
    filename: 'index.js',
    libraryTarget: 'commonjs'
  },

  resolve: {
    // This allows you to set a fallback for where Webpack should look for modules.
    // We placed these paths second because we want `node_modules` to "win"
    // if there are any conflicts. This matches Node resolution mechanism.
    // https://github.com/facebookincubator/create-react-app/issues/253
    modules: ['node_modules', paths.appModules].concat(
      // FIXME: NOT TRUE
      // It is guaranteed to exist because we tweak it in `env.js`
      (process.env.NODE_PATH || '').split(path.delimiter).filter(Boolean)
    ),
    // These are the reasonable defaults supported by the Node ecosystem.
    extensions: ['.js', '.json'],
    plugins: [
      // Prevents users from importing files from outside of src/ (or node_modules/).
      // This often causes confusion because we only process files within src/ with babel.
      // To fix this, we prevent you from importing files out of src/ -- if you'd like to,
      // please link the files into your node_modules/ and let module-resolution kick in.
      // Make sure your source files are compiled, as they will not be processed in any way.
      new ModuleScopePlugin(paths.appSrc)
    ]
  },
  module: {
    strictExportPresence: true,
    rules: [
      // Disable require.ensure as it's not a standard language feature.
      { parser: { requireEnsure: false } },

      // Run the linter
      {
        test: /\.js$/,
        enforce: 'pre',
        use: [
          {
            options: {
              formatter: eslintFormatter,
              baseConfig: {
                extends: [require.resolve('eslint-config-alexa-app')]
              },
              ignore: false,
              useEslintrc: false
            },
            loader: require.resolve('eslint-loader')
          }
        ],
        include: paths.appSrc
      },

      // Process JS with Babel.
      {
        test: /\.js$/,
        include: paths.appSrc,
        loader: require.resolve('babel-loader'),
        options: {
          babelrc: false,
          presets: [require.resolve('babel-preset-alexa-app')]
        }
      }
    ]
  },
  plugins: [
    // Makes some environment variables available to the JS code, for example:
    // if (process.env.NODE_ENV === 'production') { ... }. See `./env.js`.
    // It is absolutely essential that NODE_ENV was set to production here.
    new webpack.DefinePlugin(env.stringified)
  ]
};
