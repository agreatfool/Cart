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
var webpackDevServer = require("webpack-dev-server");

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
gulp.task('clean', function() { // 清理任务
  return gulp.src(
    [
      // 删除所有最终输出结果
      libPath.join(PWD, 'client', '*'),
      libPath.join('!' + PWD, 'client', '*_placeholder'),
      libPath.join(PWD, 'common', '*'),
      libPath.join('!' + PWD, 'common', '*_placeholder'),
      libPath.join(PWD, 'server', '*'),
      libPath.join('!' + PWD, 'server', '*_placeholder')
    ], { read: false })
    .pipe(rimraf())
    .on('error', handleError);
});

gulp.task('src:eslint', function() { // 源代码 ES6 lint 检查
  return gulp.src([
      libPath.join(PWD, 'src', 'client', '*'),
      libPath.join(PWD, 'src', 'common', '*'),
      libPath.join(PWD, 'src', 'server', '*')
    ])
    .pipe(eslint())
    .on('error', handleError)
    .pipe(eslint.format())
    .pipe(eslint.failOnError());
});

gulp.task('src:babel:client', function() { // 源代码 babel 转码
  return gulp.src([
      libPath.join(PWD, 'src', 'client', '*'),
      libPath.join('!' + PWD, 'src', 'client', 'bower', '*')
    ])
    .pipe(babel())
    .pipe(gulp.dest('dist'));
});

gulp.task('default', ['clean'], function() {
  gulp.start(
    'src:eslint'
  );
});
