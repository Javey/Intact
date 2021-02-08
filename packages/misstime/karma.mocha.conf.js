const webpack = require('webpack');
const commonConfig = require('./karma.conf');

const customLaunchers = {
    sl_chrome: {
        base: 'SauceLabs',
        browserName: 'chrome',
        platform: 'Windows 7',
        // version: '58'
    },
    sl_firefox: {
        base: 'SauceLabs',
        browserName: 'firefox',
        platform: 'Windows 7',
        // version: '53'
    },
    // sl_opera: {
        // base: 'SauceLabs',
        // browserName: 'opera',
        // platform: 'Windows 7',
        // // version: '12'
    // },
    sl_safari: {
        base: 'SauceLabs',
        browserName: 'safari',
        platform: 'macOS 10.12',
        version: '10'
    },
    // sl_ios_safari_9: {
        // base: 'SauceLabs',
        // browserName: 'iphone',
        // version: '10.3'
    // },
    // 'SL_ANDROID4.4': {
        // base: 'SauceLabs',
        // browserName: 'android',
        // platform: 'Linux',
        // version: '4.4'
    // },
    SL_ANDROID5: {
        base: 'SauceLabs',
        browserName: 'android',
        platform: 'Linux',
        version: '5.1'
    },
    SL_ANDROID6: {
        base: 'SauceLabs',
        browserName: 'Chrome',
        platform: 'Android',
        version: '6.0',
        device: 'Android Emulator'
    },
};

[9, 10, 11, 13, 14].forEach(v => {
    customLaunchers[`sl_ie${v}`] = {
        base: 'SauceLabs',
        browserName: v === 13 || v === 14 ? 'MicrosoftEdge' : 'internet explorer',
        platform: `Windows ${v === 13 || v === 14 ? '10' : '7'}`,
        version: v 
    };
});

module.exports = function(config) {
    commonConfig(config);
    config.set({
        browsers: Object.keys(customLaunchers),
        customLaunchers: customLaunchers,
        reporters: ['dots', 'saucelabs'],
    });
};
