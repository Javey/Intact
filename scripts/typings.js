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
            const filePath = join(cwd, 'dist', file);
            if (file === 'index.d.ts') {
                const contents = await fs.readFile(filePath, {encoding: 'utf8'}).replace('vue-legacy', 'vue');
                await fs.writeFile(filePath, contents);
                continue;
            }
            const stat = await fs.stat(filePath);
            if (stat.isDirectory()) {
                fs.rm(filePath, {recursive: true, force: true});
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
