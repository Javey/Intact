const config = require('./rollup.config');

config.dest = 'dist/index.js';
config.format = 'cjs';

module.exports = config;
