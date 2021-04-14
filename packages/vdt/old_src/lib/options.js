import fs from 'fs';
import * as utils from './utils';

export const defaultOptions = utils.Options;
utils.extend(defaultOptions, {
    doctype: '<!DOCTYPE html>',
    force: false,
    autoReturn: true,
    extname: 'vdt',
    views: 'views',
    delimiters: utils.getDelimiters() 
});

export function setDefaults(key, value) {
    var options = {};
    if (typeof key === 'string') {
        options[key] = value;
    } else {
        options = key;
    }
    if (options.hasOwnProperty('delimiters')) {
        utils.setDelimiters(options['delimiters']);
    }
    return utils.extend(defaultOptions, options);
}

export function getDefaults(key) {
    if (key == null) {
        return defaultOptions;
    } else {
        return defaultOptions[key];
    }
}
