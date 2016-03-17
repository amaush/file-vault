var gulp = require('gulp'),
    uglify = require('gulp-uglify'),
    jshint = require('gulp-jshint'),
    concat = require('gulp-concat');


gulp.task('jshint', function(){
  return gulp.src('public/js/filevault.*')
    .pipe(jshint())
    .pipe(jshint.reporter('default'))
});

gulp.task('scripts', function(){
    return gulp.src(['./public/js/filevault.js'
            , './public/js/filevault.data.js'
            , './public/js/filevault.model.js'
            //, './public/js/filevault.util_b.js'
            , './public/js/filevault.gallery.js'
            , './public/js/filevault.modal.js'
            , './public/js/filevault.user.js'
            , './public/js/filevault.main.js'])
        .pipe(concat('scripts.js'))
        .pipe(uglify())
        .pipe(gulp.dest('./public/dist/'));
}
);

gulp.task('minify-js-libs', function(){
    gulp.src('./public/js/jq/*.js')
        .pipe(uglify())
        .pipe(gulp.dest('./public/dist/'));
});

gulp.task('default', ['scripts', 'minify-js-libs']);


