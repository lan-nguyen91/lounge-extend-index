'use strict';

const gulp = require('gulp');
const gulpEslint = require('gulp-eslint');
const gulpJsonlint = require('gulp-jsonlint');
const gulpDebug = require('gulp-debug');
const gulpJasmine = require('gulp-jasmine');
const gulpIstanbul = require('gulp-istanbul');
const gulpSequence = require('gulp-sequence');
const argv = require('yargs').argv;
const guppy = require('git-guppy')(gulp);


const JasmineConsoleReporter = require('jasmine-console-reporter');
const reporter = new JasmineConsoleReporter({
  colors: 1,           // (0|false)|(1|true)|2
  cleanStack: 1,       // (0|false)|(1|true)|2|3
  verbosity: 2,        // (0|false)|1|2|(3|true)|4
  listStyle: 'indent', // "flat"|"indent"
  activity: false
});

//const FUNCTIONS_COVERAGE_THRESHOLD = 1;

const allOfMyLintFiles = [
  '!node_modules/**',
  '!**/node_modules/**',
  '!coverage/**',
  '!Gulpfile.js',
  '**/*.js'
];

const allOfMyTestFiles = [
  '!node_modules/**',
  '!**/node_modules/**',
  '!coverage/**',
  '**/*.spec.js'
];

const allOfMyCoverageFiles = [
  '!node_modules/**',
  '!server.js',
  '!coverage/**',
  '!Gulpfile.js',
  '!**/*.spec.js',
  '**/*.js'
];

const allOfMyJsonFiles = [
  '!node_modules/**',
  '!coverage/**',
  '**/*.json'
];

let source = argv.source;

// option (-c or --coverage--off) to turn off istanbul coverage reporting for debugging unit tests. istanbul would instrument code and distort line numbers.
let coverageOff = argv.c || argv.coverageOff;

gulp.task('lint', function lint () {
  return gulp.src(source || allOfMyLintFiles)
    .pipe(gulpDebug({ title: 'lint:' }))
    .pipe(gulpEslint())
    .pipe(gulpEslint.format()); //pipe(gulpEslint.failAfterError());
});

gulp.task('json-lint', function jsonlint () {
  return gulp.src(allOfMyJsonFiles)
    //.pipe(gulpDebug({ title: 'json-lint' }))
    .pipe(gulpJsonlint())
    .pipe(gulpJsonlint.failAfterError())
    .pipe(gulpJsonlint.reporter());
});

gulp.task('pre-jasmine', function preJasmine () {
  let pipes = gulp.src(source || allOfMyCoverageFiles);
  if (!coverageOff) {
    pipes = pipes.pipe(gulpIstanbul({includeUntested: true}));
  }

  pipes.pipe(gulpIstanbul.hookRequire());
  return pipes;
});

gulp.task('jasmine', ['pre-jasmine'], function jasmine () {
  let pipes = gulp.src(source || allOfMyTestFiles)
    .pipe(gulpDebug({ title: 'jasmine:' }))
    .pipe(gulpJasmine({
      verbose: true,
      timeout: 1000,
      includeStackTrace: true,
      reporter: reporter
    }));

  if (!coverageOff) {
    pipes = pipes.pipe(gulpIstanbul.writeReports());
  }

  return pipes;
});

//add lint back when it's cleaner: gulpSequence('lint', 'jasmine'));
gulp.task('test', gulpSequence('lint', 'json-lint', 'jasmine'));

gulp.task('watch', ['test'], function watch () {
  gulp.watch(allOfMyTestFiles, ['test']);
});

gulp.task('debug', function debug () {
  return gulp.src(allOfMyTestFiles).
    pipe(gulpDebug({
      title: 'jasmine:'
    })).
    pipe(gulpJasmine({
      verbose: true,
      timeout: 1000,
      includeStackTrace: true
    }));
});

gulp.task('pre-commit', ['test']);

gulp.task('default', ['test']);
