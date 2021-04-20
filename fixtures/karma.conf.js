const webpack = require('webpack');
const path = require('path');

module.exports = function(config) {
    config.set({
        browsers: process.env.UPDATE || process.env.CI || process.env.PRUNE ? ['ChromeHeadless'] : undefined,
        files: [
            path.resolve(__dirname, 'test.index.js'),
        ],
        preprocessors: {
            [path.resolve(__dirname, 'test.index.js')]: ['webpack'],
            '**/__snapshots__/**/*.md': ['snapshot'],
        },
        webpack: {
            mode: 'development',
            module: {
                rules: [
                    {
                        test: /\.ts/,
                        loader: 'ts-loader',
                    },
                    {
                        test: /\.ts$/,
                        // include: /packages\/\w+\/src\/.*\.ts$/,
                        include: /packages\/vdt\/src\/.*\.ts$/,
                        enforce: 'post',
                        use: {
                            loader: 'istanbul-instrumenter-loader',
                            options: {esModule: true}
                        }
                    },
                    {
                        test: /\.css$/,
                        use: ['style-loader', 'css-loader'],
                    }
                ]
            },
            resolve: {
                extensions: ['.ts', '.js'],
                alias: {
                    'intact-shared': path.resolve(__dirname, '../packages/shared/src/index.ts'),
                    'misstime': path.resolve(__dirname, '../packages/misstime/src/index.ts'),
                }
            },
            devtool: 'inline-source-map',
        },
        frameworks: [
            // 'jasmine',
            'mocha',
            'sinon-chai',
            'snapshot',
            'mocha-snapshot',
        ],
        // reporters: ['kjhtml', 'coverage-istanbul'],
        reporters: ['mocha', 'coverage-istanbul'],
        snapshot: {
            update: !!process.env.UPDATE,
            prune: !!process.env.PRUNE,
        },
        mochaReporter: {
            showDiff: true,
        },
        client: {
            mocha: {
                reporter: 'html',
                ui: 'bdd',
            }
        },
        coverageIstanbulReporter: {
            reports: ['html', 'text-summary', 'lcovonly'],
            dir: path.resolve('./coverage/'),
            fixWebpackSourcePaths: true,
        },
    });
};
