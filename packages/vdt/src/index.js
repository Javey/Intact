import Vdt from './lib/vdt';
import compile from './lib/compile';
import * as utils from './lib/utils';
import middleware from './lib/middleware';
import {defaultOptions, setDefaults, getDefaults} from './lib/options';

function renderFile(file, options) {
    options || (options = {});
    utils.extend(defaultOptions, options.settings);
    var template = compile(file),
        vdt = Vdt(template);
    return defaultOptions.doctype + '\n' + vdt.renderString(options);
}

function __express(file, options, callback) {
    utils.extend(options.settings, {
        extname: options.settings['view engine'],
        views: options.settings['views'],
        force: !options.settings['view cache']
    });
    try {
        return callback(null, renderFile(file, options));
    } catch (e) {
        return callback(e);
    }
}

Vdt.renderFile = renderFile;
Vdt.__express = __express;
Vdt.setDefaults = setDefaults;
Vdt.getDefaults = getDefaults;
Vdt.middleware = middleware;
Vdt.require = compile;

export default Vdt;
