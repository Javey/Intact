const rimfaf = require('rimraf');
const {join, basename} = require('path');
const mergedirs = require('merge-dirs').default;
const cwd = process.cwd();
const name = basename(cwd);
const fs = require('fs/promises');

if (name === 'intact-vue') {
    mergedirs(join(cwd, 'dist/', name, 'src'), join(cwd, 'dist'), 'overwrite');
    (async () => {
        const files = await fs.readdir(join(cwd, 'dist'));
        for (const file of files) {
            const stat = await fs.stat(join(cwd, 'dist', file));
            if (stat.isDirectory()) {
                fs.rm(join(cwd, 'dist', file), {recursive: true, force: true});
            }
        }
    })();
} else {
    mergedirs(join(cwd, 'dist/packages/', name, 'src'), join(cwd, 'dist'), 'overwrite');
    (async () => {
        fs.rm(join(cwd, 'dist/packages'), {recursive: true, force: true});
    });
}

// rimfaf.sync(join(cwd, 'dist/packages'));
