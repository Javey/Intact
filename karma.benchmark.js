const webpack = require('webpack');
const path = require('path');

module.exports = function(config) {
    config.set({
        // logLevel: config.LOG_DEBUG,
        files: [
            './benchmarks/*.js',
        ],
        // preprocessors: {
            // './benchmarks/*.ts': ['webpack']
        // },
        webpack: {
            mode: 'development',
            module: {
                rules: [
                    {
                        test: /\.ts/,
                        loader: 'ts-loader',
                    },
                ]
            },
            resolve: {
                extensions: ['.ts', '.js'],
                alias: {
                    'misstime': path.resolve('./packages/misstime/src'),
                },
            },
            devtool: 'inline-source-map',
        },
        frameworks: [
            'benchmark',
        ],
        reporters: ['benchmark'],
        browsers: ['Chrome'],
        singleRun: true,
    });
};
