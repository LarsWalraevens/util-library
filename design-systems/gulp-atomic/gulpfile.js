'use strict';

// yarn add gulp browser-sync gulp-sass sass gulp-autoprefixer gulp-css-globbing gulp-iconfont gulp-iconfont-css --dev

const gulp = require('gulp');
const browserSync = require('browser-sync').create();
const sass = require('gulp-sass')(require('sass'));
const autoprefixer = require('gulp-autoprefixer');
const globbing = require('gulp-css-globbing');
const iconfont = require('gulp-iconfont');
const iconfontCss = require('gulp-iconfont-css');

// CSS task
function sass2css() {
  return gulp
    .src('./styles/*.scss') // Source Sass files (main file imports everything)
    .pipe(globbing({
      extensions: ['.scss']
    }))
    .pipe(sass()) // Compile Sass to CSS
    .pipe(autoprefixer()) // Add vendor prefixes
    .pipe(gulp.dest('./styles')) // Output the CSS file
    .pipe(browserSync.stream()); // Inject the updated CSS without reloading the page
}

// Task to generate icon fonts from SVG files
function generateIconFonts() {
  return gulp
    .src(['./icons/*.svg']) // Source SVG files
    .pipe(iconfontCss({
      path: './icons/_template.scss',
      fontName: 'icons',
      targetPath: '../styles/01_fundaments/_icons.scss',
      fontPath: './fonts/'
    })) // Generate the SCSS file for icon fonts
    .pipe(iconfont({
      fontName: 'icons',
      formats: ['ttf', 'eot', 'woff', 'svg', 'woff2'],
      normalize: true,
      fontHeight: 128,
      descent: 24
    })) // Generate the icon fonts
    .pipe(gulp.dest('./fonts/')) // Output the fonts
    .pipe(browserSync.stream()); // Inject the updated fonts without reloading the page
}

// Watch files for changes
function watchFiles() {
  browserSync.init({
    open: false,
    server: "./styles/**/*.scss" // Serve the compiled CSS files for live reloading
  });

  gulp
    .watch("./styles/**/*.scss", sass2css) // Watch Sass files for changes and compile to CSS
    .on('change', browserSync.reload);

  gulp
    .watch("./icons/*.svg", generateIconFonts) // Watch SVG files for changes and generate icon fonts
    .on('change', browserSync.reload);
}

const watch = gulp.series(watchFiles);

// Export tasks
exports.default = watch;
