const webpack = require('webpack');
const path = require('path');
const {VueLoaderPlugin} = require('vue-loader');

const isMocha = !!process.env.MOCHA;
const file = isMocha ?
    path.resolve(__dirname, '../benchmarks/indexWithMocha.ts') :
    path.resolve(__dirname, '../benchmarks/index.ts');

module.exports = function(config) {
    config.set({
        // logLevel: config.LOG_DEBUG,
        files: [file],
        preprocessors: {
            [file]: ['webpack'],
        },
        webpack: {
            mode: 'development',
            // mode: isMocha ? 'development' : 'production',
            module: {
                rules: [
                    {
                        test: /\.tsx?/,
                        loader: 'ts-loader',
                        options: {
                            configFile: path.resolve(__dirname, '../tsconfig.json'),
                            appendTsSuffixTo: [/.vue$/],
                        }
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
                    'misstime': path.resolve('./packages/misstime/src'),
                    'intact': path.resolve(__dirname, '../packages/intact/src/index.ts'),
                    'intact-react': path.resolve(__dirname, '../packages/intact-react/src/index.ts'),
                    'intact-vue-next': path.resolve(__dirname, '../packages/intact-vue-next/src/index.ts'),
                    'vdt': path.resolve(__dirname, '../packages/vdt/src/index.ts'),
                    'vdt-compiler': path.resolve(__dirname, '../packages/compiler/src/index.ts'),
                    'intact-vue-next': path.resolve(__dirname, '../packages/intact-vue-next/src/index.ts'),
                    'vue$': 'vue/dist/vue.esm-bundler.js',
                    'vue-legacy$': 'vue-legacy/dist/vue.esm.js',
                },
            },
            devtool: 'inline-source-map',
            plugins: [
                new VueLoaderPlugin(),
                new webpack.DefinePlugin({
                    'process.env.NODE_ENV': '"production"',
                })
            ],
        },
        frameworks: [
            isMocha ? 'mocha' : 'benchmark',
        ],
        client: {
            mocha: {
                reporter: 'html',
                ui: 'bdd',
                allowUncaught: true,
            }
        },
        // reporters: ['benchmark'],
        reporters: [isMocha ? 'mocha' : 'benchmark'],
        // browsers: ['Chrome'],
        singleRun: true,
    });
};
