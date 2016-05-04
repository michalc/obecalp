var gulp = require('gulp');
var BUILD_DIR = 'build';

gulp.task('build', function() {
  var files = gulp.src(['src/index.html']);
  return files.pipe(gulp.dest('build'))
});

gulp.task('publish', ['build'], function() {
  var concurrent = require('concurrent-transform');
  var awspublish = require('gulp-awspublish');

  var publisher = awspublish.create({
    region: 'eu-west-1',
    params: {
      Bucket: 'obecalp.co'
    }
  });

  // All files are forced since gulp-awspublish doesn't
  // sync if there are just http header changes
  function publish(headers) {
    return concurrent(publisher.publish(headers, {force: true}), 8);
  }

  // Cache 5 mins + gzip
  var index = gulp.src('index.html', {cwd: BUILD_DIR})
    .pipe(awspublish.gzip())
    .pipe(publish({
      'Cache-Control': 'max-age=' + 60 * 5 + ', no-transform, public'
    }));

  return index
    .pipe(publisher.sync())
    .pipe(awspublish.reporter());
});

gulp.task('default', ['build']);

