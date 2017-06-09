const webpack = require('webpack');

module.exports = function(config) {
    config.set({
        logLevel: config.LOG_INFO,
        files: [
            'node_modules/sinon/pkg/sinon.js',
            'test/simpleTest.js',
            'test/componentTest.js'
        ],
        preprocessors: {
            'test/**/*.js': ['webpack'],
        },
        webpack: {
            module: {
                rules: [
                    {
                        test: /\.js$/,
                        loader: 'babel-loader',
                        exclude: /node_modules/
                    }
                ]
            }
        },
        frameworks: [
            'mocha'
        ],
        plugins: [
            'karma-mocha',
            'karma-webpack'
        ],
        client: {
            mocha: {
                reporter: 'html'
            }
        },
        singleRun: true
    });
};
