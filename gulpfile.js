var gulp = require('gulp');
var autoprefixer = require('gulp-autoprefixer');
var jshint = require('gulp-jshint');
var stylish = require('jshint-stylish');
var livereload = require('gulp-livereload');
var mincss = require('gulp-minify-css');
var rename = require('gulp-rename');
var rimraf = require('rimraf');
var sass = require('gulp-ruby-sass');
var minhtml = require('gulp-minify-html');
var minimg = require('gulp-imagemin');
var cache = require('gulp-cache');
var gutil = require('gulp-util');
var source = require('vinyl-source-stream');
var browserify = require('browserify');
var watchify = require('watchify');
var deamdify = require('deamdify');
var debowerify = require('debowerify');
var uglifyify = require('uglifyify');

//-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-
//-* PREPARE
//-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-
var production = process.env.NODE_ENV === 'production';

//-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-
//-* UTILITIES
//-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-
function handleError(err) {
    console.log(err.toString());
    this.emit('end');
}

//-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-
//-* FUNCTIONS
//-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-
var Task_Styles = function() {
    return gulp.src('web/src/styles/main.scss')
        .pipe(sass({ style: 'expanded' }))
        .on('error', handleError)
        .pipe(autoprefixer('last 2 version', '> 1%', 'safari 6', 'ie 8', 'ie 9', 'ios 6', 'android 4'))
        .pipe(gulp.dest('web/public/css'))
        .pipe(rename({ suffix: '.min' }))
        .pipe(mincss())
        .pipe(gulp.dest('web/public/css'));
};

var Task_Scripts = function(needWatch) {
    var bundler = new browserify('./web/src/scripts/app.js', watchify.args);

    if (needWatch) {
        bundler = watchify(bundler);
    }

    bundler.transform(debowerify);
    bundler.transform(deamdify);
    if (production) {
        bundler.transform({ global: true }, uglifyify);
    }

    var rebundle = function() {
        var stream = bundler.bundle();
        stream.on('error', handleError);
        stream = stream.pipe(source('bundle.min.js'));
        return stream.pipe(gulp.dest('./web/public/js'));
    };

    bundler.on('update', rebundle);

    return rebundle();
};

var Task_Htmls = function() {
    return gulp.src(['web/src/**/*.html', '!web/src/bower/**/*'])
        .pipe(minhtml())
        .pipe(gulp.dest('web/public'));
};

var Task_Images = function() {
    return gulp.src(['web/src/images/**/*', '!web/src/images/packages/**/*'])
        .pipe(cache(minimg({ optimizationLevel: 5, progressive: true, interlaced: true })))
        .pipe(gulp.dest('web/public/img'));
};

//-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-
//-* TASKS
//-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-
gulp.task('clean', function(done) {
    rimraf('web/public/*', function() {
        done();
    });
});

gulp.task('lint-scripts', function() {
    return gulp.src(['web/src/scripts/**/*.js', '!web/src/scripts/packages/**/*'])
        .pipe(jshint('.jshintrc'))
        .pipe(jshint.reporter(stylish))
        .on('error', handleError);
});

gulp.task('styles', function() {
    return Task_Styles();
});

gulp.task('scripts', function() {
    return Task_Scripts(false);
});

gulp.task('htmls', function() {
    return Task_Htmls();
});

gulp.task('images', function() {
    return Task_Images();
});

gulp.task('default', ['clean'], function() {
    gulp.start('lint-scripts', 'scripts', 'styles', 'htmls', 'images');
});

gulp.task('watch', function() {
    // watch styles
    gulp.watch('web/src/styles/**/*.sass', function(event) {
        gutil.log('Style file ' + gutil.colors.cyan(event.path) + ' was ' + gutil.colors.cyan(event.type) + ', run styles sync ...');
        return Task_Styles();
    });

    // watch scripts
    gulp.watch('web/src/scripts/**/*.js', function(event) {
        gutil.log('Script file ' + gutil.colors.cyan(event.path) + ' was ' + gutil.colors.cyan(event.type) + ', run scripts sync ...');
        return Task_Scripts(true);
    });

    // watch htmls
    gulp.watch('web/src/**/*.html', function(event) {
        gutil.log('Html file ' + gutil.colors.cyan(event.path) + ' was ' + gutil.colors.cyan(event.type) + ', run htmls sync ...');
        return Task_Htmls();
    });

    // watch images
    gulp.watch('web/src/images/**/*', function(event) {
        gutil.log('Image file ' + gutil.colors.cyan(event.path) + ' was ' + gutil.colors.cyan(event.type) + ', run images sync ...');
        return Task_Images();
    });

    // livereload
    livereload.listen();
    gulp.watch(['web/public/**/*']).on('change', livereload.changed);
});
