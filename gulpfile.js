var gulp = require('gulp');
var autoprefixer = require('gulp-autoprefixer');
var concat = require('gulp-concat');
var ignore = require('gulp-ignore');
var jshint = require('gulp-jshint');
var livereload = require('gulp-livereload');
var mincss = require('gulp-minify-css');
var rename = require('gulp-rename');
var rimraf = require('gulp-rimraf');
var sass = require('gulp-ruby-sass');
var uglify = require('gulp-uglify');
var gutil = require('gulp-util');

gulp.task('clean', function() {
    return gulp.src('web/public/**/*', {read: false})
        .pipe(ignore('web/public/packages/**/*'))
        .pipe(rimraf());
});

gulp.task('default', ['clean'], function() {
    gutil.log(
        gutil.colors.black('done'),
        gutil.colors.red('done'),
        gutil.colors.green('done'),
        gutil.colors.yellow('done'),
        gutil.colors.blue('done'),
        gutil.colors.magenta('done'),
        gutil.colors.cyan('done'),
        gutil.colors.white('done'),
        gutil.colors.gray('done')
    );
});