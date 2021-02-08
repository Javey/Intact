import fs from 'fs';
import Path from 'path';
import Vdt from './vdt';
import {getDefaults} from './options';

const cache = {};

export default function(file, baseFile) {
    if (!Path.isAbsolute(file)) {
        if (file[0] === '.' && baseFile != undefined) {
            file = Path.resolve(Path.dirname(baseFile), file);
        } else if (getDefaults('views') != null) {
            file = Path.join(getDefaults('views'), file);
        } else {
            file = Path.resolve(file);
        }
    }
    if (Path.extname(file).substring(1) !== getDefaults('extname')) {
        file += '.' + getDefaults('extname');
    }

    return getDefaults('force') ? compile(0) : stat();

    function compile(mtime) {
        try {
            var contents = fs.readFileSync(file).toString();
            cache[file] = Vdt.compile(contents, {
                server: true,
                filename: file
            });
            cache[file].mtime = mtime;
            return function() {
                try {
                    return cache[file].apply(this, arguments);
                } catch (e) {
                    e.source || (e.source = []);
                    e.source.push('/* file: ' + file + ' */\n' + cache[file].source);
                    throw e;
                }
            };
        } catch (e) {
            e.message += ' in file: ' + file;
            throw e;
        }
    }

    function stat() {
        var stats = fs.statSync(file);
        var obj = cache[file];
        if (obj && obj.mtime) {
            if (obj.mtime < stats.mtime) {
                return compile(stats.mtime);
            } else {
                return obj;
            }
        } else {
            return compile(stats.mtime);
        }
    }
}
