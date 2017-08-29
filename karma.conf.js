const webpack = require('webpack');

module.exports = function(config) {
    config.set({
        logLevel: config.LOG_INFO,
        files: [
            'node_modules/sinon/pkg/sinon.js',
            'test/simpleTest.js',
            'test/componentTest.js',
            'test/animateTest.js',
        ],
        preprocessors: {
            'test/**/*.js': ['webpack'],
        },
        webpack: {
            module: {
                rules: [
                    {
                        test: /\.js$/,
                        // loader: 'babel-loader',
                        use: {
                            loader: 'istanbul-instrumenter-loader',
                            options: { esModules: true }
                        },
                        exclude: /node_modules/
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
            }
        },
        frameworks: [
            'mocha'
        ],
        plugins: [
            'karma-mocha',
            'karma-webpack',
            // 'karma-coverage',
            'karma-coverage-istanbul-reporter'
        ],
        client: {
            mocha: {
                reporter: 'html'
            }
        },
        singleRun: true,
        reporters: ['progress', 'coverage-istanbul'],
    });
};
