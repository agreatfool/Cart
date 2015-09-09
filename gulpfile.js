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
//-* GULP & Others
//-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-
var gulp = require('gulp');
var gulpif = require('gulp-if');
var eslint = require('gulp-eslint');
var rename = require('gulp-rename');
var ignore = require('gulp-ignore');
var rimraf = require('gulp-rimraf');
var minhtml = require('gulp-minify-html');
var gutil = require('gulp-util');
var babel = require('gulp-babel');
var template = require('gulp-template');
var livereload = require('gulp-livereload');
var shell = require('gulp-shell');
var runSequence = require('run-sequence');
var lodash = require('lodash');

//-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-
//-* WEBPACK
//-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-
var webpack = require('webpack-stream');
var webpackConf = require(libPath.join(PWD, 'webpack.config.js'));

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

gulp.task('src:eslint', function() { // 源代码 ES6 lint 检查，相关配置请查看 .eslintignore & .eslintrc
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

gulp.task('src:babel:common', function() { // 源代码 babel 转码
  return gulp.src([
      libPath.join(PATH.src.common.es6, '**', '*.js')
    ])
    .pipe(babel())
    .pipe(gulp.dest(libPath.join(PATH.dest.common.path, 'es6')));
});

gulp.task('src:babel:server', function() { // 源代码 babel 转码
  return gulp.src([
      libPath.join(PATH.src.server.es6, '**', '*.js')
    ])
    .pipe(babel())
    .pipe(gulp.dest(libPath.join(PATH.dest.server.path, 'es6')));
});

gulp.task('resource:common', function() { // 拷贝 common 部分无需转码代码到输出路径
  return gulp.src([
    libPath.join(PATH.src.common.path, '**', '*'),
    libPath.join('!' + PATH.src.common.es6, '**', '*')
  ])
    .pipe(gulp.dest(PATH.dest.common.path));
});

gulp.task('resource:server', function() { // 拷贝 server 部分无需转码代码到输出路径
  return gulp.src([
      libPath.join(PATH.src.server.path, '**', '*'),
      libPath.join('!' + PATH.src.server.es6, '**', '*')
    ])
    .pipe(gulpif(IS_PRODUCTION, ignore.exclude(libPath.join(PATH.src.server.boot, 'explorer.js')))) // 在生产环境不使用 explorer.js
    .pipe(gulp.dest(PATH.dest.server.path));
});

gulp.task('src:angular:gen', shell.task(['lb-ng ' + libPath.join(PATH.dest.server.path, 'server.js') + ' ' + libPath.join(PATH.src.client.es6, 'lb-services.js')])); // 生成 StrongLoop 对应的 angular 代码

gulp.task('src:angular:build', function(done) { // 生成 StrongLoop 对应的 angular 代码，完整任务，含代码文件准备等工序
  runSequence(
    'src:eslint',
    ['src:babel:common', 'src:babel:server'],
    ['resource:common', 'resource:server'],
    'src:angular:gen',
    done
  );
});

gulp.task('resource:html', function() { // 拷贝 HTML 到输出路径
  return gulp.src([
      libPath.join(PATH.src.client.path, '**', '*.html')
    ])
    .pipe(gulpif(IS_PRODUCTION, minhtml()))
    .pipe(gulp.dest(libPath.join(PATH.dest.client.path, 'public')));
});

gulp.task('webpack:build', function() { // webpack构建
  return gulp.src(libPath.join(PATH.src.client.es6, 'app.js'))
    .pipe(webpack(webpackConf, null, function(err, stats) {
      if (err) {
        throw new gutil.PluginError('webpack:build', err);
      }
      gutil.log('[webpack:build]', stats.toString({
        colors: true
      }));
    }))
    .pipe(gulp.dest(libPath.join(PATH.dest.client.path, 'public', 'js')));
});

gulp.task('default', function(done) { // 默认任务
  runSequence(
    'pre:clean',
    'src:eslint',
    ['src:babel:common', 'src:babel:server'],
    'webpack:build',
    ['resource:common', 'resource:server', 'resource:html'],
    done
  );
});

gulp.task('watch', function() {
  // 前端视图改动
  gulp.watch(libPath.join(PATH.src.client.path, '**', '*.html'), ['resource:html']);

  // common 源代码 babel 转码
  gulp.watch(libPath.join(PATH.src.common.es6, '**', '*.js'), ['src:babel:common']);

  // server 源代码 babel 转码
  gulp.watch(libPath.join(PATH.src.server.es6, '**', '*.js'), ['src:babel:server']);

  // common 部分无需转码代码改动
  gulp.watch([
    libPath.join(PATH.src.common.path, '**', '*'),
    libPath.join('!' + PATH.src.common.es6, '**', '*')
  ], ['resource:common']);

  // server 部分无需转码代码改动
  gulp.watch([
    libPath.join(PATH.src.server.path, '**', '*'),
    libPath.join('!' + PATH.src.server.es6, '**', '*')
  ], ['resource:server']);

  // 前端资源改动，则让浏览器重新加载
  livereload.listen();
  gulp.watch([libPath.join(PATH.dest.client.path, 'public', '**', '*')]).on('change', livereload.changed);

  // 前端样式和代码改动
  var conf = lodash.extend(webpackConf, { watch: true });
  gulp.src(libPath.join(PATH.src.client.es6, 'app.js'))
    .pipe(webpack(conf, null, function(err, stats) {
      if (err) {
        throw new gutil.PluginError('webpack:build', err);
      }
      gutil.log('[webpack:build]', stats.toString({
        colors: true
      }));
    }))
    .pipe(gulp.dest(libPath.join(PATH.dest.client.path, 'public', 'js')));
});
