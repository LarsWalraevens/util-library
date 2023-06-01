'use strict';

const gulp = require('gulp');
const browserSync = require('browser-sync').create();
const sass = require('gulp-sass')(require('sass'));
const autoprefixer = require('gulp-autoprefixer');
const globbing = require('gulp-css-globbing');
const cleanCSS = require('gulp-clean-css');

var iconfont = require('gulp-iconfont');
var iconfontCss = require('gulp-iconfont-css');

// CSS task
function sass2css() {
    return gulp
        .src('./sass/*.scss')
        .pipe(globbing({
            extensions: ['.scss']
        }))
        .pipe(sass())
        .pipe(autoprefixer())
        .pipe(cleanCSS())
        .pipe(gulp.dest('./sass'))
        .pipe(browserSync.stream())
}

//watch icons
function watchIcons() {
    return gulp
        .src(['./assets/icons/*.svg'])
        .pipe(iconfontCss({
            path: './assets/icons/_template.scss',
            fontName: 'icons',
            targetPath: '../../sass/01_fundaments/_icons.scss',
            fontPath: './assets/fonts/'
        }))
        .pipe(iconfont({
            fontName: 'icons',
            formats: ['ttf', 'eot', 'woff', 'svg', 'woff2'],
            normalize: true,
            fontHeight: 128,
            descent: 24
        }))
        .pipe(gulp.dest('./assets/fonts/'))
        .pipe(browserSync.stream());
}

// Watch files
function watchFiles() {
    browserSync.init({
        open: false,
        server: "./sass/**/*.scss",
        port: 3010
    });

    gulp
        .watch("./sass/**/*.scss", sass2css)
        .on('change', browserSync.reload);

    gulp
        .watch("./assets/icons/*.svg", watchIcons)
        .on('change', browserSync.reload);
}

const watch = gulp.series(watchFiles);

// export tasks
exports.default = watch;
