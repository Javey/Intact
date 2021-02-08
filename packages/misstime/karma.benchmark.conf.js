const webpack = require('webpack');

module.exports = function(config) {
    config.set({
        logLevel: config.LOG_INFO,
        files: [
            'node_modules/sinon/pkg/sinon.js',
            'src/__benchmark__/vnode.js'
        ],
        preprocessors: {
            'src/__benchmark__/**/*.js': ['webpack']
        },
        webpack: {
            module: {
                rules: [
                    {
                        test: /\.js$/,
                        loader: 'babel-loader',
                        exclude: /node-modules/
                    }
                ]
            }
        },
        frameworks: [
            'benchmark',
        ],
        reporters: [
            'benchmark',
        ],
        plugins: [
            'karma-chrome-launcher',
            'karma-webpack',
            'karma-benchmark',
            'karma-benchmark-reporter',
        ],
        browser: ['chrome'],
        client: {
            mocha: {
                reporter: 'html'
            }
        }
    });
};
