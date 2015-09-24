"use strict";
//-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-
//-* GLOBAL
//-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-
var PWD = __dirname;
var ENV = process.env.NODE_ENV ? process.env.NODE_ENV : 'develop';
var IS_PRODUCTION = ENV === 'production';
var PLATFORM = process.env.PLATFORM ? process.env.PLATFORM : 'desktop';
var IS_MOBILE = PLATFORM === 'mobile';

//-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-
//-* NodeJs LIBs
//-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-
var libFs = require('fs');
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
var jeditor = require('gulp-json-editor');
var replace = require('gulp-replace');
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

function getLocalIp() {
  var os = require('os');

  var interfaces = os.networkInterfaces();
  var addresses = [];
  for (var k in interfaces) {
    if (!interfaces.hasOwnProperty(k)) {
      continue;
    }
    for (var k2 in interfaces[k]) {
      if (!interfaces[k].hasOwnProperty(k2)) {
        continue;
      }
      var address = interfaces[k][k2];
      if (address.family === 'IPv4' && !address.internal) {
        addresses.push(address.address);
      }
    }
  }

  if (addresses.length === 0) {
    return 'localhost';
  } else {
    return addresses.shift();
  }
}

gutil.log(
  gutil.colors.yellow('GLOBAL'),
  gutil.colors.magenta('ENV'),
  gutil.colors.cyan(ENV),
  gutil.colors.magenta('PLATFORM'),
  gutil.colors.cyan(PLATFORM)
);

//-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-
//-* PATH
//-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-
var PATH = {
  src:  { path: libPath.join(PWD, 'src'), client: {}, common: {}, server: {} },
  dest: { path: PWD, client: {}, common: {}, server: {} }
};

PATH.src.client.path    = libPath.join(PATH.src.path,         'client');
PATH.src.client.es6     = libPath.join(PATH.src.client.path,  'es6');
PATH.src.client.index   = libPath.join(PATH.src.client.path,  'index.piece');
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

gulp.task('src:config:common', function() { // 根据当前gulp运行的环境变量，修改源代码配置文件中的环境变量，以便在后续的构造任务中生效
  return gulp.src(libPath.join(PATH.src.common.path, 'config.json'))
    .pipe(jeditor(function(json) {
      json.env = ENV;
      json.platform = PLATFORM;
      if (!IS_PRODUCTION && IS_MOBILE) { // 非生产环境 且 移动编译，才需要自动配置IP地址
        json.host = getLocalIp();
      }
      return json;
    }))
    .pipe(gulp.dest(PATH.src.common.path));
});

gulp.task('src:config:server', function() { // 根据当前gulp运行的环境变量，修改源代码配置文件中的环境变量，以便在后续的构造任务中生效
  return gulp.src(libPath.join(PATH.src.server.path, 'config.json'))
    .pipe(gulpif(!IS_PRODUCTION && IS_MOBILE, jeditor(function(json) { // 非生产环境 且 移动编译，才需要自动配置IP地址
      json.host = getLocalIp();
      return json;
    })))
    .pipe(gulp.dest(PATH.src.server.path));
});

gulp.task('src:app', function() {
  var appPiecePath = libPath.join(PATH.src.client.es6, 'app.piece', PLATFORM);
  return gulp.src(libPath.join(PATH.src.client.es6, 'app.js'))
    .pipe(replace(/\/\/\s?inject:import[\s\S]*\/\/\s?endinject:import/, libFs.readFileSync(libPath.join(appPiecePath, 'import.js'))))
    .pipe(replace(/\/\/\s?inject:angular[\s\S]*\/\/\s?endinject:angular/, libFs.readFileSync(libPath.join(appPiecePath, 'angular.js'))))
    .pipe(rename('app.built.js'))
    .pipe(gulp.dest(libPath.join(PATH.src.client.es6)));
});

gulp.task('src:eslint', function(done) { // 源代码 ES6 lint 检查，相关配置请查看 .eslintignore & .eslintrc
  if (IS_PRODUCTION) {
    return gulp.src([
      libPath.join(PATH.src.client.path, '**', '*.js'),
      libPath.join(PATH.src.common.path, '**', '*.js'),
      libPath.join(PATH.src.server.path, '**', '*.js')
    ])
    .pipe(eslint())
    .on('error', handleError)
    .pipe(eslint.format())
    .pipe(eslint.failOnError());
  } else {
    done();
  }
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

gulp.task('resource:html:index', function() { // 拷贝、转换 index HTML 到输出路径
  var indexPiecePath = libPath.join(PATH.src.client.index, PLATFORM);
  return gulp.src(libPath.join(PATH.src.client.path, 'index.html'))
    .pipe(replace('<!-- inject:head -->', libFs.readFileSync(libPath.join(indexPiecePath, 'head.html'))))
    .pipe(replace('<!-- inject:body -->', libFs.readFileSync(libPath.join(indexPiecePath, 'body.html'))))
    .pipe(gulpif(IS_PRODUCTION, minhtml()))
    .pipe(gulp.dest(libPath.join(PATH.dest.client.path, 'public')));
});

gulp.task('resource:html:views', function() { // 拷贝 views HTML 到输出路径
  return gulp.src([
    libPath.join(PATH.src.client.path, 'views', '*.html')
  ])
    .pipe(gulpif(IS_PRODUCTION, minhtml()))
    .pipe(gulp.dest(libPath.join(PATH.dest.client.path, 'public', 'views')));
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
    'src:config:common',
    'src:config:server',
    'src:app',
    'src:eslint',
    ['src:babel:common', 'src:babel:server'],
    'webpack:build',
    [
      'resource:common', 'resource:server',
      'resource:html:index', 'resource:html:views'
    ],
    done
  );
});

gulp.task('watch', function() {
  // 前端视图改动
  gulp.watch([
    libPath.join(PATH.src.client.path, 'index.html'),
    libPath.join(PATH.src.client.index, '**', '*.html')
  ], ['resource:html:index']);
  gulp.watch(libPath.join(PATH.src.client.views, '**', '*.html'), ['resource:html:views']);

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
