"use strict";
//-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-
//-* GLOBAL
//-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-
var PWD = __dirname;
var IS_PRODUCTION = process.env.NODE_ENV === 'production';

//-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-
//-* NodeJs LIBs
//-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-
var libPath = require('path');

//-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-
//-* GULP
//-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-
var gulp = require('gulp');
var gulpif = require('gulp-if');
var autoprefixer = require('gulp-autoprefixer');
var eslint = require('gulp-eslint');
var uglify = require('gulp-uglify');
var mincss = require('gulp-minify-css');
var rename = require('gulp-rename');
var ignore = require('gulp-ignore');
var rimraf = require('gulp-rimraf');
var sass = require('gulp-ruby-sass');
var minhtml = require('gulp-minify-html');
var gutil = require('gulp-util');
var babel = require('gulp-babel');

//-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-
//-* WEBPACK
//-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-
var webpack = require('webpack');
var webpackConf = require(libPath.join(PWD, 'webpack.config.js'));
var webpackDevServer = require('webpack-dev-server');

//-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-
//-* UTILITIES
//-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-
function handleError(err) {
  gutil.log('[Error]', err.toString({
    colors: true
  }));
  this.emit('end');
}

//-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-
//-* PATH
//-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-
var PATH = {
  src:  { path: libPath.join(PWD, 'src'), client: {}, common: {}, server: {} },
  dest: { path: PWD, client: {}, common: {}, server: {} }
};

PATH.src.client.path    = libPath.join(PATH.src.path,         'client');
PATH.src.client.es6     = libPath.join(PATH.src.client.path,  'es6');
PATH.src.client.styles  = libPath.join(PATH.src.client.path,  'styles');
PATH.src.client.views   = libPath.join(PATH.src.client.path,  'views');

PATH.src.common.path    = libPath.join(PATH.src.path,         'common');
PATH.src.common.es6     = libPath.join(PATH.src.common.path,  'es6');
PATH.src.common.models  = libPath.join(PATH.src.common.path,  'models');

PATH.src.server.path    = libPath.join(PATH.src.path,         'server');
PATH.src.server.boot    = libPath.join(PATH.src.server.path,  'boot');
PATH.src.server.es6     = libPath.join(PATH.src.server.path,  'es6');

PATH.dest.client.path   = libPath.join(PATH.dest.path,        'client');
PATH.dest.common.path   = libPath.join(PATH.dest.path,        'common');
PATH.dest.server.path   = libPath.join(PATH.dest.path,        'server');

//-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-
//-* TASKS
//-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-
gulp.task('pre:clean', function() { // 清理任务，删除所有最终输出结果
  return gulp.src(
    [
      libPath.join(PATH.dest.client.path, '**', '*'),
      libPath.join('!' + PATH.dest.client.path, '*_placeholder'),
      libPath.join(PATH.dest.common.path, '**', '*'),
      libPath.join('!' + PATH.dest.common.path, '*_placeholder'),
      libPath.join(PATH.dest.server.path, '**', '*'),
      libPath.join('!' + PATH.dest.server.path, '*_placeholder')
    ], { read: false })
    .pipe(rimraf())
    .on('error', handleError);
});

gulp.task('src:eslint', ['pre:clean'], function() { // 源代码 ES6 lint 检查，相关配置请查看 .eslintignore & .eslintrc
  return gulp.src([
      libPath.join(PATH.src.client.path, '**', '*.js'),
      libPath.join(PATH.src.common.path, '**', '*.js'),
      libPath.join(PATH.src.server.path, '**', '*.js')
    ])
    .pipe(eslint())
    .on('error', handleError)
    .pipe(eslint.format())
    .pipe(eslint.failOnError());
});

gulp.task('src:babel:common', ['src:eslint'], function() { // 源代码 babel 转码
  return gulp.src([
      libPath.join(PATH.src.common.es6, '**', '*.js')
    ])
    .pipe(babel())
    .pipe(gulp.dest(libPath.join(PATH.dest.common.path, 'es6')));
});

gulp.task('src:babel:server', ['src:eslint'], function() { // 源代码 babel 转码
  return gulp.src([
      libPath.join(PATH.src.server.es6, '**', '*.js')
    ])
    .pipe(babel())
    .pipe(gulp.dest(libPath.join(PATH.dest.server.path, 'es6')));
});

gulp.task('resource:common', ['src:babel:common'], function() {
  return gulp.src([
    libPath.join(PATH.src.common.path, '**', '*'),
    libPath.join('!' + PATH.src.common.es6, '**', '*')
  ])
    .pipe(gulp.dest(PATH.dest.common.path));
});

gulp.task('resource:server', ['src:babel:server'], function() {
  return gulp.src([
      libPath.join(PATH.src.server.path, '**', '*'),
      libPath.join('!' + PATH.src.server.es6, '**', '*')
    ])
    .pipe(gulp.dest(PATH.dest.server.path));
});

gulp.task('resource:html', ['pre:clean'], function() { // 拷贝 HTML 到输出路径
  return gulp.src([
      libPath.join(PATH.src.client.path, '**', '*.html')
    ])
    .pipe(minhtml())
    .pipe(gulp.dest(libPath.join(PATH.dest.client.path, 'public')));
});

gulp.task('default', [
    'pre:clean',
    'src:eslint'
  ], function() { // 默认任务
  gulp.start(
    'src:babel:common',
    'src:babel:server',
    'webpack:build',
    'resource:common',
    'resource:server',
    'resource:html'
  );
});

gulp.task('webpack:build', ['src:babel:common', 'src:babel:server'], function(done) {
  var conf = Object.create(webpackConf);
  conf.devtool = 'sourcemap';
  conf.debug = true;

  var compiler = webpack(conf);

  compiler.run(function(err, stats) {
    if (err) {
      throw new gutil.PluginError('webpack:build', err);
    }
    gutil.log('[webpack:build]', stats.toString({
      colors: true
    }));
    done();
  });
});
