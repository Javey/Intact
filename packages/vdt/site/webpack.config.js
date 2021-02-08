var webpackConfig = require('kpc/src/webpack.config');
var path = require('path');
var webpack = require('webpack');
// var HtmlWebpackPlugin = require('html-webpack-plugin');

webpackConfig.entry.all = path.resolve(__dirname, './js/app/routes.js');
webpackConfig.output.path = path.resolve(__dirname, './dist');
// webpackConfig.output.filename = '[name].[chunkhash:8].js';
process.disableHardSource = true;
process.disableHMR = true;
webpackConfig.module.rules.push({
    test: /\.json$/,
    loader: 'json-loader'
});
webpackConfig.module.noParse = [
    /node_modules\/benchmark/
];
webpackConfig.module.rules[0].exclude = [
    /node_modules(?!([\/\\]kpc)|([\/\\]misstime))/, 
    /node_modules[\/\\]kpc.*lib/
];
// webpackConfig.plugins = webpackConfig.plugins.filter(item => {
    // return !(item instanceof webpack.optimize.UglifyJsPlugin);
// });
// webpackConfig.plugins.push(
    // new webpack.ProvidePlugin({
        // Intact: 'kpc/src/js/lib/intact',
        // _: 'kpc/src/js/lib/underscore',
    // }),
    // new HtmlWebpackPlugin({
        // template: path.resolve(__dirname, './index.html'),
    // }),
// );

webpackConfig.devServer = {
    contentBase: [path.resolve(__dirname, './dist'), path.resolve(__dirname, '../')],
    port: 9001,
};


module.exports = webpackConfig;
