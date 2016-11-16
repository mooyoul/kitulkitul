'use strict';

const
  path                = require('path'),
  webpack             = require('webpack'),
  ExtractTextPlugin   = require('extract-text-webpack-plugin'),
  HtmlWebpackPlugin   = require('html-webpack-plugin'),
  isProduction        = process.env.NODE_ENV === 'production';


if (!process.env.NODE_ENV) {
  process.env.NODE_ENV = 'development';
}

const config = {
  entry: {
    app: './src/entry.js'
  },
  output: {
    filename: isProduction ? 'kitulkitul-ui.min.js' : 'kitulkitul-ui.js',
    chunkFilename: isProduction ? 'bundle-[id]-[hash].js' : 'bundle-[id].js',
    path: 'dist'
  },
  module: {
    loaders: [
      { test: /\.js$/i, loader: 'babel', exclude: path.join(__dirname, 'node_modules') },
      { test: /\.jade$/i, loaders: ['html', 'jade-html?{locals: false}'] },
      { test: /\.css/i, loader: ExtractTextPlugin.extract(['css']) },
      { test: /\.sass/i, loader: ExtractTextPlugin.extract(['css', 'sass']) },
      { test: /\.(png|jpg|gif|jpeg|ico)/i, loaders: ['url?limit=10240&name=images/[hash].[ext]'] },
      { test: /\.(woff|woff2|eot|ttf|svg)/i, loaders: ['url?limit=10240&name=fonts/[hash].[ext]'] }
    ]
  },
  externals: {
    'kiturami': 'require("kiturami")'
  },
  plugins: [
    new ExtractTextPlugin(isProduction ? '[name]-[hash].css' : '[name].css', {
      allChunks: true
    }),
    new HtmlWebpackPlugin({
      template: 'src/index.html',
      inject: false,
      env: process.env,
      minify: {
        removeComments: true,
        collapseBooleanAttributes: true
      }
    })
  ],
  htmlLoader: {

  },
  sassLoader: {
    includePaths: [
      path.resolve(__dirname, 'node_modules/compass-mixins/lib'),
      path.resolve(__dirname, 'assets/common-styles'),
    ]
  },
  callbackLoader: {
    getEnv: (key) => `"${process.env[key] || ''}"`
  },
  devServer: {
    historyApiFallback: true
  },
  target: 'electron-renderer'
};



if (isProduction) {
  config.plugins.push(new webpack.optimize.DedupePlugin());
  config.plugins.push(new webpack.optimize.UglifyJsPlugin({
    compress: {
      warnings: false
    }
  }));
  config.plugins.push(new webpack.optimize.OccurrenceOrderPlugin(true));
  config.plugins.push(new webpack.SourceMapDevToolPlugin({
    filename: '[file].map',
    moduleFilenameTemplate: 'webpack:///[resourcePath]',
    fallbackModuleFilenameTemplate: 'webpack:///[resourcePath]?[hash]',
    append: [
      '',
      '',
      `//@ sourceMappingURL=${process.env.PROTOCOL}://${process.env.HOST}/app/[url]`,
      `//# sourceMappingURL=${process.env.PROTOCOL}://${process.env.HOST}/app/[url]`,
    ].join('\n'),
    module: true,
    columns: true
  }));
  config.htmlLoader.root = __dirname;
}

module.exports = exports = config;
