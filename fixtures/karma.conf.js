const webpack = require('webpack');
const path = require('path');

module.exports = function(config) {
    config.set({
        files: [
            path.resolve(__dirname, 'test.index.js'),
        ],
        preprocessors: {
            [path.resolve(__dirname, 'test.index.js')]: ['webpack'],
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
                        include: /packages\/\w+\/src\/.*\.ts$/,
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
            },
            devtool: 'inline-source-map',
        },
        frameworks: [
            'jasmine',
        ],
        reporters: ['kjhtml', 'coverage-istanbul'],
        coverageIstanbulReporter: {
            reports: ['html', 'text-summary', 'lcovonly'],
            dir: path.resolve('./coverage/'),
            fixWebpackSourcePaths: true,
        },
    });
};
