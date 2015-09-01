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
  console.log(err.toString());
  this.emit('end');
}

//-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-
//-* TASKS
//-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-
gulp.task('clean', function() { // 清理任务，删除所有最终输出结果
  return gulp.src(
    [
      libPath.join(PWD, 'client', '**', '*'),
      libPath.join('!' + PWD, 'client', '*_placeholder'),
      libPath.join(PWD, 'common', '**', '*'),
      libPath.join('!' + PWD, 'common', '*_placeholder'),
      libPath.join(PWD, 'server', '**', '*'),
      libPath.join('!' + PWD, 'server', '*_placeholder')
    ], { read: false })
    .pipe(rimraf())
    .on('error', handleError);
});

gulp.task('src:eslint', ['clean'], function() { // 源代码 ES6 lint 检查，相关配置请查看 .eslintignore & .eslintrc
  return gulp.src([
      libPath.join(PWD, 'src', 'client', '**', '*.js'),
      libPath.join(PWD, 'src', 'common', '**', '*.js'),
      libPath.join(PWD, 'src', 'server', '**', '*.js')
    ])
    .pipe(eslint())
    .on('error', handleError)
    .pipe(eslint.format())
    .pipe(eslint.failOnError());
});

gulp.task('src:babel:common', function() { // 源代码 babel 转码
  return gulp.src([
      libPath.join(PWD, 'src', 'common', 'es6', '**', '*.js')
    ])
    .pipe(babel())
    .pipe(gulp.dest(libPath.join(PWD, 'common')));
});

gulp.task('src:babel:server', function() { // 源代码 babel 转码
  return gulp.src([
      libPath.join(PWD, 'src', 'server', 'es6', '**', '*.js')
    ])
    .pipe(babel())
    .pipe(gulp.dest(libPath.join(PWD, 'server')));
});

gulp.task('resource:html', function() { // 拷贝 HTML 到输出路径
  return gulp.src([
      libPath.join(PWD, 'src', 'client', '**', '*.html')
    ])
    .pipe(minhtml())
    .pipe(gulp.dest(libPath.join(PWD, 'client', 'public')));
});

gulp.task('default', [
    'clean',
    //'src:eslint'
  ], function() { // 默认任务
  gulp.start(
    'src:babel:common',
    'src:babel:server',
    'webpack:build',
    'resource:html'
  );
});

gulp.task('webpack:build', function(done) {
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
