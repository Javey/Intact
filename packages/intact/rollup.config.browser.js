const config = require('./rollup.config');
const replace = require('rollup-plugin-replace');

config.dest = 'dist/intact.js';
config.plugins.push(replace({
    'process.env.NODE_ENV': "'development'"
}));

module.exports = config;
