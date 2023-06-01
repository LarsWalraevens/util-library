'use strict';

// Required npm packages
const gulp = require('gulp'); // Gulp task runner
const browserSync = require('browser-sync').create(); // Live browser reloading
const sass = require('gulp-sass')(require('sass')); // Sass compiler
const autoprefixer = require('gulp-autoprefixer'); // CSS autoprefixer
const concat = require('gulp-concat'); // File concatenation

// CSS task that compiles scss (Sass files) to CSS
function sass2css() {
    return gulp
        .src('./styles/**/*.scss') // Source Sass files
        .pipe(concat('custom.scss')) // Concatenate all Sass files into a single file
        .pipe(sass()) // Compile Sass to CSS
        .pipe(autoprefixer()) // Add vendor prefixes to CSS
        .pipe(gulp.dest('./dist/')) // Output directory for compiled CSS
        .pipe(browserSync.stream()); // Inject changes into the browser
}

// Watch files for changes and run corresponding tasks
function watchFiles() {
    // Initialize BrowserSync server
    browserSync.init({
        open: false,
        server: "./styles/**/*.scss",
    });

    // Watch Sass files and run sass2css task on change
    gulp
        .watch("./styles/**/*.scss", sass2css)
        .on('change', browserSync.reload);

    // Add more watch tasks if needed
    // Example: gulp.watch("./src/**/*.js", javascriptTask);
}

// Create main task with series of tasks
const watch = gulp.series(watchFiles);

exports.default = watch;