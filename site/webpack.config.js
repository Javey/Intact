const webpack = require('webpack');
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
    entry: {
        'buddle-intact': path.resolve(__dirname, './main.js'),
    },
    output: {
        path: path.resolve(__dirname, './dist'),
        filename: '[name].js',
        chunkFilename: 'static/chunk/[chunkhash].js',
        // publicPath: process.env.NODE_ENV === 'production' ? './dist/' : '/dist/'
    },
    devtool: process.env.NODE_ENV !== 'production' ? '#inline-source-map' : undefined,
    module: {
        rules: [
            {
                test: /\.js$/,
                use: [
                    {
                        loader: 'babel-loader',
                        options: {
                            "presets": [["es2015", {"loose": true}], "stage-0"],
                            "plugins": [
                                "transform-es3-property-literals",
                                "transform-es3-member-expression-literals",
                                "transform-decorators-legacy",
                                "transform-remove-strict-mode",
                            ]
                        }
                    }
                ]
            },
            {
                test: /\.vdt$/,
                use: [
                    {
                        loader: 'babel-loader',
                    },
                    {
                        loader: 'vdt-loader',
                        options: {
                            delimiters: ['{', '}'],
                            skipWhitespace: true,
                            noWith: true,
                        }
                    },
                ]
            },
            {
                test: /\.(styl|css)$/,
                use: [
                    {
                        loader: 'style-loader'
                    },
                    {
                        loader: 'css-loader'
                    },
                    {
                        loader: 'stylus-loader',
                        options: {
                            'include css': true
                        }
                    },
                ]
            }
        ]
    },
    resolve: {
        extensions: ['.js', '.vdt'],
        // mainFields: ['module', 'browserify', 'browser', 'main']
    },
    plugins: [
        new webpack.optimize.CommonsChunkPlugin({
            children: true,
            async: true,
            minChunks: 3
        }),
        new webpack.ProvidePlugin({
            Intact: [path.resolve(__dirname, '../src/index.js'), 'default'],
            $: 'jquery'
        }),
        new HtmlWebpackPlugin({
            template: path.resolve(__dirname, './index.html'),
        }),
    ],
    devServer: {
        contentBase: [path.resolve(__dirname, './dist'), path.resolve(__dirname, '../')],
        port: 9000,
    }
};

if (process.env.NODE_ENV === 'production') {
    module.exports.plugins.push(new webpack.optimize.UglifyJsPlugin({
        compress: {
            warnings: false
        }
    }));
}

