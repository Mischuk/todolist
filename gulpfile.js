// Общее
var gulp                = require('gulp');
var plumber             = require('gulp-plumber');
var beeper              = require('beeper');
var gutil               = require('gulp-util');
var chalk               = require('chalk');
var clean               = require('gulp-clean');
var include             = require("gulp-include");
var concat              = require('gulp-concat');
var rename              = require('gulp-rename');
var cache               = require('gulp-cache');
var rmEL                = require('gulp-remove-empty-lines');
var zip                 = require('gulp-zip');
var del                 = require('del');

// Сервер
var browserSync         = require('browser-sync').create();
var reload              = browserSync.reload;
var ftp                 = require('vinyl-ftp');

// Стили
var stylus              = require('gulp-stylus');
var sourcemaps          = require('gulp-sourcemaps');
var postcss             = require('gulp-postcss');
var autoprefixer        = require('autoprefixer');
var sorting             = require('postcss-sorting');
var cssnano             = require('cssnano');
var cssbeautify         = require('gulp-cssbeautify');

// Разметка
var pug                 = require('gulp-pug');
var cached              = require('gulp-cached');
var changed             = require('gulp-changed');
var pugInheritance      = require('gulp-pug-inheritance');
var gulpif              = require('gulp-if');
var filter              = require('gulp-filter');
var posthtml            = require('gulp-posthtml');
var posthtmllorem       = require('posthtml-lorem');
var posthtmlAttrsSorter = require('posthtml-attrs-sorter');
var posthtmlAltAlways   = require('posthtml-alt-always');
var prettify            = require('gulp-html-prettify');
var htmlnano            = require('gulp-htmlnano');
var htmlbeautify        = require('gulp-html-beautify');


/* ========================= */
/*          СЕРВЕР           */
/* ========================= */
gulp.task('serve', function() {
  browserSync.init({
    server: './app',
    port: 8080,
    open: false,
    reloadOnRestart: false,
    notify: false
  });

  gulp.watch('dev/**/*.styl', ['styl']);
  gulp.watch('dev/**/*.pug', ['pug-watch']);
  gulp.watch('dev/modules/**/*.pug', ['pug-module']);
  gulp.watch('dev/modules/**/*.js', ['js:modules','js:compile','js:build']);
  gulp.watch('dev/components/**/*.js', ['js:modules','js:compile','js:build']);
  gulp.watch('dev/static/js/main.js', ['js:modules','js:compile','js:build']);
});


/* ======================== */
/*           ОБЩЕЕ          */
/* ======================== */

  // Обработчик ошибок
  var plumberError = function (err) {
    beeper();
    gutil.log([(err.name + ' in ' + err.plugin), '', chalk.red(err.message), ''].join('\n'));
    this.emit('end');
  };

/* ======================== */
/*          ШАБЛОНЫ         */
/* ======================== */

  gulp.task('templates', function() {
      var YOUR_LOCALS = {
        "message": "This app is initialed"
      };
      return gulp.src(['dev/**/*.pug', '!dev/**/_*.pug', '!dev/**/m_*.pug', '!dev/components/**/*.pug'])
        .pipe(plumber({
          errorHandler: plumberError
        }))
        .pipe(changed('./app', {
          extension: '.html'
        }))
        .pipe(cached('pug'))
        .pipe(pugInheritance({
          basedir: './dev/templates',
          skip: 'node_modules'
        }))
        .pipe(pug({
          doctype: 'HTML',
          pretty: false,
          locals: YOUR_LOCALS
        }))
        .pipe(posthtml({
          plugins: [
            posthtmlAttrsSorter({
              order: [ 'class', 'id', 'name', 'data', 'ng', 'src', 'for', 'type', 'href', 'values', 'title', 'alt', 'role', 'aria' ]
            }),
            posthtmllorem(),
            posthtmlAltAlways(),
            htmlnano({
              removeEmptyAttributes: false
            })
          ]
          }))
        .pipe(gulp.dest('./app/'))
        .pipe(reload({stream:true}));
  });

  gulp.task('pug-module', function buildHTML() {
    return gulp.src(['dev/templates/*.pug', '!dev/templates/_*.pug'])
      .pipe(plumber({
        errorHandler: plumberError
      }))
      .pipe(changed('src', {
          extension: '.html'
      }))
      .pipe(pug())
      .pipe(gulp.dest('./app'))
      .pipe(reload({stream: true}));
  });

  gulp.task('pug-watch', ['templates']);


/* ========================= */
/*          СТИЛИ            */
/* ========================= */

  gulp.task('styl', function() {
    return gulp.src('./dev/static/styl/app.styl')
      .pipe(plumber({
        errorHandler: plumberError
      }))
      .pipe(sourcemaps.init())
      .pipe(stylus({
        compress: false
      }))
      .pipe(postcss(
        [
          sorting(),
          autoprefixer()
        ]
      ))
      .pipe(sourcemaps.write())
      .pipe(gulp.dest('./app/css'))
      .pipe(reload({stream: true}));
  });


/* ========================= */
/*          СКРИПТЫ          */
/* ========================= */

  gulp.task('js:modules', function() {
    return gulp.src(['dev/modules/**/*.js', 'dev/components/**/*.js'])
      .pipe(plumber({
        errorHandler: plumberError
      }))
      .pipe(include({
        hardFail: true,
        includePaths: [
          __dirname + "/",
          __dirname + "/node_modules",
          __dirname + "/dev/modules/",
          __dirname + "/dev/components/"
        ]
      }))
      .pipe(concat('modules.js', { newLine: '\n\n' }))
      .pipe(gulp.dest('tmp/js'));
  });

  gulp.task('js:compile', ['js:modules'], function() {
    return gulp.src("dev/static/js/main.js")
      .pipe(gulp.dest("tmp/js"));
  });

  gulp.task('js:build', ['js:compile'], function() {
    return gulp.src("tmp/js/main.js")
      .pipe(include({
        extensions: "js",
        hardFail: true,
        includePaths: [
          __dirname + "/tmp/js"
        ]
      }))
      .pipe(rename({basename:'app'}))
      .pipe(rmEL())
      .pipe(gulp.dest("app/js"))
      .pipe(reload({stream:true}));
  });


/* ========================= */
/*          ПЛАГИНЫ          */
/* ========================= */

  gulp.task('js:dependencies', function() {
    gulp.src(['dev/static/js/jquery.min.js'])
      .pipe(gulp.dest("app/js"));
  });


/* ========================= */
/*          ЗАДАЧИ           */
/* ========================= */

  gulp.task('dev',
    [
      'serve',
      'styl',
      'templates',
      'js:dependencies',
      'js:modules',
      'js:compile',
      'js:build'
    ]
  );














