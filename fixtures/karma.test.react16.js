const webpack = require('webpack');
const path = require('path');
const {VueLoaderPlugin} = require('vue-loader');

const isDebug = !(process.env.UPDATE || process.env.CI || process.env.PRUNE);

module.exports = function(config) {
    config.set({
        browsers: !isDebug ? ['ChromeHeadless'] : undefined,
        files: [
            path.resolve(__dirname, '../packages/intact-react/__tests__/react16.tsx'),
        ],
        preprocessors: {
            [path.resolve(__dirname, '../packages/intact-react/__tests__/react16.tsx')]: ['webpack', 'sourcemap'],
            '**/__snapshots__/**/*.md': ['snapshot'],
        },
        webpack: {
            mode: 'development',
            // mode: 'production',
            module: {
                rules: [
                    {
                        test: /\.tsx?/,
                        // exclude: [
                            // path.resolve(__dirname, '../packages/intact-vue-next'),
                        // ],
                        loader: 'ts-loader',
                        options: {
                            configFile: path.resolve(__dirname, '../tsconfig.json'),
                            appendTsSuffixTo: [/.vue$/],
                        }
                    },
                    {
                        test: /\.css$/,
                        use: ['style-loader', 'css-loader'],
                    },
                ]
            },
            resolve: {
                extensions: ['.ts', '.tsx', '.js'],
                alias: {
                    'intact-shared': path.resolve(__dirname, '../packages/shared/src/index.ts'),
                    'misstime': path.resolve(__dirname, '../packages/misstime/src/index.ts'),
                    'intact': path.resolve(__dirname, '../packages/intact/src/index.ts'),
                    'vdt': path.resolve(__dirname, '../packages/vdt/src/index.ts'),
                    'vdt-compiler': path.resolve(__dirname, '../packages/compiler/src/index.ts'),
                    'react': 'react-16',
                    'react-dom': 'react-dom-16',
                }
            },
            devtool: 'inline-source-map',
        },
        frameworks: [
            // 'jasmine',
            'webpack',
            'mocha',
            'sinon-chai',
            'snapshot',
            'mocha-snapshot',
        ],
        // reporters: ['kjhtml', 'coverage-istanbul'],
        // reporters: ['mocha', 'coverage-istanbul'],
        reporters: ['coverage-istanbul'],
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
                allowUncaught: true,
            }
        },
        coverageIstanbulReporter: {
            reports: ['html', 'text-summary', 'lcovonly'],
            dir: path.resolve('./coverage/'),
            fixWebpackSourcePaths: true,
        },
        singleRun: !isDebug,
    });
};
