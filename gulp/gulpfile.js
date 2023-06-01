'use strict';

// Required npm packages
const gulp = require('gulp'); // Gulp task runner
const browserSync = require('browser-sync').create(); // Live browser reloading
const sass = require('gulp-sass')(require('sass')); // Sass compiler
const autoprefixer = require('gulp-autoprefixer'); // CSS autoprefixer
const globbing = require('gulp-css-globbing'); // CSS globbing
const cleanCSS = require('gulp-clean-css'); // CSS minification
const iconfont = require('gulp-iconfont'); // Icon font generation
const iconfontCss = require('gulp-iconfont-css'); // Icon font CSS generation

// CSS task
function sass2css() {
    return gulp
        .src('./sass/*.scss') // Source Sass files
        .pipe(globbing({
            extensions: ['.scss']
        })) // CSS globbing
        .pipe(sass()) // Compile Sass to CSS
        .pipe(autoprefixer()) // Add vendor prefixes to CSS
        .pipe(cleanCSS()) // Minify CSS
        .pipe(gulp.dest('./sass')) // Output directory for compiled CSS
        .pipe(browserSync.stream()); // Inject changes into the browser
}

// Icon font task
function watchIcons() {
    return gulp
        .src(['./assets/icons/*.svg']) // Source SVG icons
        .pipe(iconfontCss({
            path: './assets/icons/_template.scss',
            fontName: 'icons',
            targetPath: '../../sass/01_fundaments/_icons.scss',
            fontPath: './assets/fonts/'
        })) // Generate icon font CSS file
        .pipe(iconfont({
            fontName: 'icons',
            formats: ['ttf', 'eot', 'woff', 'svg', 'woff2'],
            normalize: true,
            fontHeight: 128,
            descent: 24
        })) // Generate icon font files
        .pipe(gulp.dest('./assets/fonts/')) // Output directory for generated font files
        .pipe(browserSync.stream()); // Inject changes into the browser
}

// Watch files for changes and run corresponding tasks
function watchFiles() {
    // Initialize BrowserSync server
    browserSync.init({
        open: false,
        server: "./sass/**/*.scss",
        port: 3010
    });

    // Watch Sass files and run sass2css task on change
    gulp
        .watch("./sass/**/*.scss", sass2css)
        .on('change', browserSync.reload);

    // Watch icon SVG files and run watchIcons task on change
    gulp
        .watch("./assets/icons/*.svg", watchIcons)
        .on('change', browserSync.reload);
}

// Create main task with series of tasks
const watch = gulp.series(watchFiles);

// Export tasks
exports.default = watch;
