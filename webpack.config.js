var PWD = __dirname;

var libPath = require('path');
var webpack = require('webpack');

module.exports = {
  cache: true,
  entry: [
    'webpack/hot/dev-server',
    libPath.join(PWD, 'src', 'client', 'es6', 'app.js')
  ],
  output: {
    path: libPath.join(PWD, 'client', 'public', 'js'),
    filename: 'bundle.js'
  },
  module: {
    loaders: [
      { test: /\.html$/, loader: 'raw' },
      { test: /\.js$/, loader: 'babel', exclude: /(node_modules|bower_components)/ },
      { test: /\.css$/, loader: 'style-loader!css-loader' },
      { test: /\.scss$/, loader: 'style!css!sass' }
    ]
  },
  plugins: [
    new webpack.HotModuleReplacementPlugin()
  ]
};
