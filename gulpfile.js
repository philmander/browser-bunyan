var gulp = require('gulp');
var jshint = require('gulp-jshint');
var uglify = require('gulp-uglify');
var browserify = require('browserify');
var vinylStream = require('vinyl-source-stream');
var del = require('del');
var rename = require('gulp-rename');

gulp.task('clean', function () {
    return del('./dist/**/*.*');
});

//jshint
gulp.task('lint', function() {
    return gulp.src('./lib/*.js')
        .pipe(jshint())
        .pipe(jshint.reporter('default'))
        .pipe(jshint.reporter('fail'));
});

//package with browserify
gulp.task('package', [ 'lint', 'clean' ], function() {
    return browserify({
        entries: './lib/bunyan.js',
        standalone: 'browserBunyan'
    })
        .bundle()
        .pipe(vinylStream('browser-bunyan.js'))
        .pipe(gulp.dest('./dist'));
});

gulp.task('minify', [ 'package' ], function() {


    return gulp.src('./dist/browser-bunyan.js')
        .pipe(uglify())
        .pipe(rename('browser-bunyan.min.js'))
        .pipe(gulp.dest('./dist'));
});

gulp.task('default', ['minify']);