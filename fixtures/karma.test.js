const webpack = require('webpack');
const path = require('path');
const {VueLoaderPlugin} = require('vue-loader');

const isDebug = !(process.env.UPDATE || process.env.CI || process.env.PRUNE);

module.exports = function(config) {
    config.set({
        browsers: !isDebug ? ['ChromeHeadless'] : undefined,
        files: [
            path.resolve(__dirname, 'test.index.ts'),
        ],
        preprocessors: {
            [path.resolve(__dirname, 'test.index.ts')]: ['webpack', 'sourcemap'],
            '**/__snapshots__/**/*.md': ['snapshot'],
        },
        webpack: {
            mode: 'development',
            module: {
                rules: [
                    {
                        test: /\.tsx?/,
                        loader: 'ts-loader',
                        options: {
                            appendTsSuffixTo: [/.vue$/]
                        }
                    },
                    {
                        test: /\.tsx?$/,
                        include: /packages\/\w+\/src\/.*\.ts$/,
                        // include: /packages\/vdt\/src\/.*\.ts$/,
                        enforce: 'post',
                        use: {
                            loader: 'istanbul-instrumenter-loader',
                            options: {esModules: true}
                        }
                    },
                    {
                        test: /\.css$/,
                        use: ['style-loader', 'css-loader'],
                    },
                    {
                        test: /\.vue$/,
                        loader: 'vue-loader'
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
                    'intact-vue-next': path.resolve(__dirname, '../packages/intact-vue-next/src/index.ts'),
                    'vue$': 'vue/dist/vue.esm-bundler.js',
                }
            },
            devtool: 'inline-source-map',
            plugins: [
                new VueLoaderPlugin(),
            ],
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
