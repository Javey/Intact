var gulp = require('gulp'),
    tap = require('gulp-tap'),
    nocache = require('gulp-nocache'),
    sequence = require('gulp-sequence'),
    _ = require('lodash'),
    tasks = require('kpc/src/tasks/tasks'),
    sequence = require('gulp-sequence'),
    childProcess = require('child_process');

tasks.paths.css.push('./@(css|pages)/**/*.@(css|styl)');
_.extend(tasks.paths, {
    images: ['./node_modules/kpc/src/images/**/*.gif'],
    tpl: './index.html',
    other: [],
});


// 覆盖一些用不到的任务
gulp.task('config', _.noop);
gulp.task('node_modules:copy', _.noop);

gulp.task('build', sequence('clean:gh-pages', 'dev', 'copy:build', 'push'));

gulp.task('clean:gh-pages', function() {
    return exec(`rm -rf ./gh-pages; REPO=\`git config remote.origin.url\`; echo $REPO;
        git clone -b gh-pages --single-branch $REPO ./gh-pages &&
        cd ./gh-pages &&
        rm -rf ./*`
    );
});

gulp.task('copy', function() {
    return exec('cp ../docs ./gh-pages -r');
});

gulp.task('copy:build', function() {
    return exec('cp ./build/* ./gh-pages -r');
});

gulp.task('push', function() {
    return exec(`cd ./gh-pages && 
        git add -A;
        TIME=\`date +"%Y-%m-%d %H:%M:%S"\`;
        git commit -am "build: \${TIME}";
        git push origin gh-pages`
    );
});

function exec(command) {
    return new Promise(function(resolve, reject) {
        var cmd = childProcess.exec(command, {maxBuffer: 50000 * 1024}, function(err, stdout) {
            if (err) {
                reject(err);
            } else {
                resolve(stdout);
            }
        });
        cmd.stdout.pipe(process.stdout);
        cmd.stderr.pipe(process.stderr);
    });
}
