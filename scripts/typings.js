const rimfaf = require('rimraf');
const {join} = require('path');
const mergedirs = require('merge-dirs').default;
const cwd = process.cwd();
const pkgJson = require(join(cwd, 'package.json'));

mergedirs(join(cwd, 'dist/packages/', pkgJson.name === 'intact-shared' ? 'shared' : pkgJson.name, 'src'), join(cwd, 'dist'), 'overwrite');
rimfaf.sync(join(cwd, 'dist/packages'));
