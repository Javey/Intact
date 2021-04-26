const webpack = require('webpack');
const path = require('path');

module.exports = function(config) {
    config.set({
        // logLevel: config.LOG_DEBUG,
        files: [
            path.resolve(__dirname, 'benchmark.index.js'),
        ],
        preprocessors: {
            [path.resolve(__dirname, 'benchmark.index.js')]: ['webpack'],
        },
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
                    'intact-shared': path.resolve(__dirname, '../packages/shared/src/index.ts'),
                    'misstime': path.resolve('./packages/misstime/src'),
                },
            },
            devtool: 'inline-source-map',
        },
        frameworks: [
            'benchmark',
        ],
        reporters: ['benchmark'],
        // browsers: ['Chrome'],
        singleRun: true,
    });
};
