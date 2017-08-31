const webpack = require('webpack');
const commonConfig = require('./karma.conf');

const customLaunchers = {
    sl_chrome: {
        base: 'SauceLabs',
        browserName: 'chrome',
        platform: 'Windows 7',
        version: '58'
    },
    sl_firefox: {
        base: 'SauceLabs',
        browserName: 'firefox',
        platform: 'Windows 7',
        version: '53'
    },
    sl_opera: {
        base: 'SauceLabs',
        browserName: 'opera',
        platform: 'Windows 7',
        version: '12'
    },
    sl_safari: {
        base: 'SauceLabs',
        browserName: 'safari',
        platform: 'macOS 10.12',
        version: '10'
    },
    sl_ios_safari: {
        base: 'SauceLabs',
        browserName: 'safari',
        platform: 'iOS',
        version: '10.3'
    },
    sl_android: {
        base: 'SauceLabs',
        browserName: 'Browser',
        deviceName: 'Samsung Galaxy S3 Emulator',
        deviceOrientation: 'portrait',
        platform: 'Android',
        version: '4.4',
    }
};

[8, 9, 10, 11, 13, 14].forEach(v => {
    customLaunchers[`sl_ie${v}`] = {
        base: 'SauceLabs',
        browserName: v === 13 || v === 14 ? 'MicrosoftEdge' : 'internet explorer',
        platform: `Windows ${v === 13 || v === 14 ? '10' : '7'}`,
        version: v 
    };
});

// remove animate test for saucelabs
commonConfig.files.pop();
module.exports = function(config) {
    commonConfig(config);
    config.set({
        browsers: Object.keys(customLaunchers),
        customLaunchers: customLaunchers,
        reporters: ['dots', 'saucelabs'],
        sauceLabs: {
            testName: 'Intact Unit Tests',
            recordScreenshots: false,
        },
        captureTimeout: 120000,
    });
};
