const childProcess = require('child_process');
const webpack = require('webpack');
const webpackConfig = require('./webpack.config');

clean().then(() => {
    return build();
}).then(() => {
    return copy();
}).then(() => {
    return push();
});

function clean() {
    return exec(`rm -rf ./site/dist; REPO=\`git config remote.origin.url\`; echo $REPO;
        git clone -b gh-pages --single-branch $REPO ./site/dist &&
        cd ./site/dist &&
        rm -rf ./* && cd ../../`
    );
}

function build() {
    return new Promise(resolve => {
        webpack(webpackConfig, (err, stats) => {
            console.log(stats.toString({
                colors: true,
            }));
            resolve();
        });
    });
}

function copy() {
    return exec('cp ./docs ./site/dist -r');
}

function push() {
    return exec(`cd ./site/dist && 
        git add -A;
        TIME=\`date +"%Y-%m-%d %H:%M:%S"\`;
        git commit -am "build: \${TIME}";
        git push origin gh-pages`
    );
}

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
