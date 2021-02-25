var _package = require('./package.json'),
    stream = require('stream'),
    childProcess = require('child_process');

function exec(command) {
    console.log(command);
    var cmd = childProcess.exec(command);
    cmd.stdout.pipe(process.stdout);
    cmd.stderr.pipe(process.stderr);
}

exec('npm publish');
exec('git tag -a v' + _package.version + ' -m "Release version ' + _package.version + '" && git push origin master --tags');
