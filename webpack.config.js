var PWD = __dirname;

var libPath = require('path');
var webpack = require('webpack');

module.exports = {
  devtool: 'sourcemap',
  debug: true,
  cache: true,
  entry: [
    libPath.join(PWD, 'src', 'client', 'es6', 'app.built.js')
  ],
  output: {
    path: libPath.join(PWD, 'client', 'public', 'js'),
    filename: 'bundle.js'
  },
  resolve: {
    modulesDirectories: ['bower_components', 'node_modules']
  },
  module: {
    loaders: [
      // file type loaders
      { test: /\.html$/, loader: 'raw' },
      { test: /\.js$/, loader: 'babel?optional[]=es7.asyncFunctions', exclude: /(node_modules|bower_components|lb-services\.js)/ },
      { test: /\.json$/, loader: 'json-loader' },
      { test: /\.css$/, loader: 'style-loader!css-loader' },
      { test: /\.scss$/, loader: 'style!css!autoprefixer!sass' },
      { test: /\.(woff|woff2|ttf|eot)([\?]?.*)$/, loader: 'url-loader?limit=100000' },
      { test: /\.svg([\?]?.*)$/, loader: 'svg-inline' },
      // AMD exports loaders
      { test: /[\/]angular\.js$/, loader: 'exports?angular' },
      { test: /[\/]angular-resource\.js$/, loader: "exports?angular.module('ngResource').name" },
      { test: /[\/]angular-animate\.js$/, loader: "exports?angular.module('ngAnimate').name" },
      { test: /[\/]angular-sanitize\.js$/, loader: "exports?angular.module('ngSanitize').name" },
      { test: /[\/]angular-touch\.js$/, loader: "exports?angular.module('ngTouch').name" },
      { test: /[\/]ionic-angular\.js$/, loader: "exports?angular.module('ionic').name" },
      { test: /[\/]lb-services\.js$/, loader: "exports?angular.module('lbServices').name" }
    ]
  },
  plugins: [
    new webpack.ResolverPlugin([
      new webpack.ResolverPlugin.DirectoryDescriptionFilePlugin('bower.json', ['main'])
    ])
  ]
};

/**
 * Some issues solved while using webpack:
 *
 * 1. Bower loader issue
 *    Want to add support for bower resources, and
 *    add resolve: { modulesDirectories: ['bower_components', 'node_modules'] }
 *      & plugins: [ ... new webpack.ResolverPlugin.DirectoryDescriptionFilePlugin('bower.json', ['main']) ... ]
 *    in config.
 *    This Action make bower resources available to webpack, but error comes with the loading of angular resource:
 *      "Uncaught TypeError: _angular2.default.module is not a function"
 *    Need to add exports setting in module.loaders, like: { test: /[\/]angular\.js$/, loader: 'exports?angular' }
 *
 * 2. StrongLoop lb-ng generated codes:
 *    Code generated by lb-ng loaded like "import lbServices from './lb-services.js';" not work, error:
 *      "Uncaught Error: [$injector:modulerr] Failed to instantiate module app due to:
 *      Error: [$injector:modulerr] Failed to instantiate module {} due to:
 *      Error: [ng:areq] Argument 'module' is not a function, got Object"
 *    Reason is the library of third party angular modules are AMD style, and they are packed into CommonJS style
 *    by webpack, and the angular on the web cannot found the specified resources with AMD style codes.
 *    We need to add loaders for those modules who not added the support for CommonJS.
 *    One example who SUPPORT CommonJS, angular-ui-router.js:
 *      "\/\* commonjs package manager support (eg componentjs) \*\/
 *      if (typeof module !== "undefined" && typeof exports !== "undefined" && module.exports === exports){
 *        module.exports = 'ui.router';
 *      }"
 *    And those who not supported, you shall add loaders like:
 *      { test: /[\/]angular-resource\.js$/, loader: "exports?angular.module('ngResource').name" }
 *      OR
 *      { test: /[\/]lb-services\.js$/, loader: "exports?angular.module('lbServices').name" }
 */
