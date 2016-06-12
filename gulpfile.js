/**
 * Created by Ico on 11-Jun-16.
 */

var gulp = require('gulp');
var gulpConcat = require('gulp-concat');

var config = {
    paths: {
        html: './index.html',
        js: [
            './scripts/libraries/jQuery/*.js',
            './scripts/libraries/myRequireLibrary/*.js'
        ],
        dist: './build'
    }
};

gulp.task('html', function () {
    gulp.src(config.paths.html)
        .pipe(gulp.dest(config.paths.dist));
});

gulp.task('js', function () {
    gulp.src(config.paths.js)
        .pipe(gulpConcat('bundle.js'))
        .pipe(gulp.dest(config.paths.dist));
});

gulp.task('watch', function () {
    gulp.watch(config.paths.html, ['html']);
    gulp.watch(config.paths.js, ['js']);
});

gulp.task('default', ['html', 'js', 'watch']);