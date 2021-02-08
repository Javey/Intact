const webpack = require('webpack');
const commonConfig = require('./karma.conf');

module.exports = function(config) {
    commonConfig(config);
};
