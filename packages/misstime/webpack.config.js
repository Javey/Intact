const webpack = require('webpack');

module.exports = {
    entry: './src/__benchmark__/vpatch.js',
    output: {
        filename: 'dist/test.js',
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                loader: 'babel-loader',
                exclude: /node-modules/
            }
        ]
    }
};
