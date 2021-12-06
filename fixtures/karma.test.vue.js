const moduleAlias = require('module-alias');
const webpack = require('webpack');
const path = require('path');
const {VueLoaderPlugin} = require('@vue-loader/legacy');

moduleAlias.addAliases({
    'vue': path.resolve(__dirname, '../node_modules/vue-legacy'),
});

const isDebug = !(process.env.UPDATE || process.env.CI || process.env.PRUNE);

module.exports = function(config) {
    config.set({
        browsers: !isDebug ? ['ChromeHeadless'] : undefined,
        files: [
            path.resolve(__dirname, '../packages/intact-vue/__tests__/index.ts'),
        ],
        preprocessors: {
            [path.resolve(__dirname, '../packages/intact-vue/__tests__/index.ts')]: ['webpack', 'sourcemap'],
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
                            configFile: path.resolve(__dirname, '../packages/intact-vue/tsconfig.json'),
                            appendTsSuffixTo: [/.vue$/],
                        }
                    },
                    {
                        test: /\.tsx?$/,
                        include: /packages\/intact-vue\/src\/.*\.ts$/,
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
                        use: require.resolve('@vue-loader/legacy'),
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
                    'vue$': 'vue-legacy/dist/vue.esm.js',
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
