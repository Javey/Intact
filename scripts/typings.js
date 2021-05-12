const rimfaf = require('rimraf');
const {join, basename} = require('path');
const mergedirs = require('merge-dirs').default;
const cwd = process.cwd();
const name = basename(cwd);

mergedirs(join(cwd, 'dist/packages/', name, 'src'), join(cwd, 'dist'), 'overwrite');
rimfaf.sync(join(cwd, 'dist/packages'));
