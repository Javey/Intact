const webpack = require('webpack');
const commonConfig = require('./karma.conf');

// const customLaunchers = {
    // sl_chrome: {
        // base: 'SauceLabs',
        // browserName: 'chrome',
        // platform: 'Windows 7',
        // version: '58'
    // },
    // sl_firefox: {
        // base: 'SauceLabs',
        // browserName: 'firefox',
        // platform: 'Windows 7',
        // version: '53'
    // },
    // sl_opera: {
        // base: 'SauceLabs',
        // browserName: 'opera',
        // platform: 'Windows 7',
        // version: '12'
    // },
    // sl_safari: {
        // base: 'SauceLabs',
        // browserName: 'safari',
        // platform: 'macOS 10.12',
        // version: '10'
    // },
    // sl_ios_safari: {
        // base: 'SauceLabs',
        // browserName: 'iphone',
        // platform: 'OS X 10.9',
        // version: '7.1'
    // },
    // sl_android: {
        // base: 'SauceLabs',
        // browserName: 'Browser',
        // deviceName: 'Samsung Galaxy S3 Emulator',
        // deviceOrientation: 'portrait',
        // platform: 'Android',
        // version: '4.4',
    // }
// };

// [8, 9, 10, 11, 13, 14].forEach(v => {
    // customLaunchers[`sl_ie${v}`] = {
        // base: 'SauceLabs',
        // browserName: v === 13 || v === 14 ? 'MicrosoftEdge' : 'internet explorer',
        // platform: `Windows ${v === 13 || v === 14 ? '10' : '7'}`,
        // version: v 
    // };
// });

const customLaunchers ={
    sl_win_chrome: {
        base: 'SauceLabs',
        browserName: 'chrome',
        platform: 'Windows 10'
    },
    sl_mac_chrome: {
        base: 'SauceLabs',
        browserName: 'chrome',
        platform: 'macOS 10.12'
    },
    sl_firefox: {
        base: 'SauceLabs',
        browserName: 'firefox',
        platform: 'Windows 10'
    },
    sl_mac_firfox: {
        base: 'SauceLabs',
        browserName: 'firefox',
        platform: 'macOS 10.12'
    },
    // for https://stackoverflow.com/questions/46913856/value-is-not-a-sequence-safari-exception
    // sl_safari: {
        // base: 'SauceLabs',
        // browserName: 'safari',
        // platform: 'macOS 10.12'
    // },
    sl_edge: {
        base: 'SauceLabs',
        browserName: 'MicrosoftEdge',
        platform: 'Windows 10'
    },
    sl_ie_11: {
        base: 'SauceLabs',
        browserName: 'internet explorer',
        version: '11.103',
        platform: 'Windows 10'
    },
    sl_ie_10: {
        base: 'SauceLabs',
        browserName: 'internet explorer',
        version: '10.0',
        platform: 'Windows 7'
    },
    sl_ie_9: {
        base: 'SauceLabs',
        browserName: 'internet explorer',
        version: '9.0',
        platform: 'Windows 7'
    },
    // sl_ie_8: {
        // base: 'SauceLabs',
        // browserName: 'internet explorer',
        // version: '8.0',
        // platform: 'Windows 7'
    // },
    sl_ios_safari_9: {
        base: 'SauceLabs',
        browserName: 'iphone',
        version: '10.3'
    },
    'SL_ANDROID4.4': {
        base: 'SauceLabs',
        browserName: 'android',
        platform: 'Linux',
        version: '4.4'
    },
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
    }
}; 

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
