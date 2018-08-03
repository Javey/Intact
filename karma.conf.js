const webpack = require('webpack');

module.exports = function(config) {
    config.set({
        logLevel: config.LOG_INFO,
        files: module.exports.files, 
        preprocessors: {
            'test/**/*.js': ['webpack'],
        },
        webpack: {
            devtool: 'inline-source-map',
            module: {
                rules: [
                    {
                        test: /\.js$/,
                        // exclude: [/node_modules(?!([\/\\]vdt)|([\/\\]misstime))/],
                        loader: 'babel-loader',

                        // use: {
                            // loader: 'istanbul-instrumenter-loader',
                            // options: {esModules: true}
                        // },
                        // enforce: 'post',
                        // exclude: /node_modules/
                    },
                    {
                        test: /\.css$/,
                        use: ['style-loader', 'css-loader']
                    },
                    {
                        test: /\.vdt$/,
                        loader: 'vdt-loader?skipWhitespace'
                    }
                ]
            },
            resolve: {
                mainFields: ['module', 'browser', 'main']
            }
        },
        frameworks: [
            'mocha'
        ],
        plugins: [
            'karma-mocha',
            'karma-webpack',
            // 'karma-coverage',
            'karma-coverage-istanbul-reporter',
            'karma-sauce-launcher',
        ],
        client: {
            mocha: {
                reporter: 'html'
            }
        },
        concurrency: 2,
        singleRun: true,
        reporters: ['progress', 'coverage-istanbul'],
    });
};

module.exports.files = [
    // 'node_modules/babel-polyfill/dist/polyfill.js',
    'test/polyfill.js',
    'node_modules/sinon/pkg/sinon.js',
    'test/simpleTest.js',
    'test/componentTest.js',
    'test/lifecycle.js',
    'test/animateTest.js',
];


