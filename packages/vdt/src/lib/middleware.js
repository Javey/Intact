import url from 'url';
import Vdt from './vdt';
import fs from 'fs';
import * as Utils from './utils';
import Path from 'path';

export default function(options) {
    options = options || {};

    if (typeof options === 'string') {
        options = {
            src: options
        };
    }

    options = Utils.extend({
        src: process.cwd(),
        amd: true,
        force: false,
        autoReturn: true,
        onlySource: true,
        delimiters: Utils.getDelimiters(),
        filterSource: function(source) {
            return source;
        }
    }, options);

    var cache = {};

    return function(req, res, next) {
        if ('GET' != req.method && 'HEAD' != req.method) return next();

        var path = url.parse(req.url).pathname;
        if (!/\.js/.test(path)) return next();

        var vdtFile = Path.join(options.src, path.replace(/\.js$/, '.vdt'));

        options.force ? compile(0) : stat();

        function error(err) {
            next(err.code === 'ENOENT' ? null : err);
        }

        function compile(mtime) {
            fs.readFile(vdtFile, 'utf-8', function(err, contents) {
                if (err) return error(err);
                try {
                    var obj = cache[vdtFile] =  Vdt.compile(contents, options);
                    if (options.amd) {
                        obj.source = 'define(function(require) {\n return ' + obj.source + '\n})';
                    }
                    obj.mtime = mtime;
                    obj.source = options.filterSource(obj.source);
                    return send(obj.source);
                } catch (e) {
                    return error(e);
                }
            });
        }

        function send(source) {
            res.set('Content-Type', 'application/x-javascript')
                .send(source);
        }

        function stat() {
            fs.stat(vdtFile, function(err, stats) {
                if (err) return error(err);

                var obj = cache[vdtFile];
                if (obj && obj.mtime) {
                    if (obj.mtime < stats.mtime) {
                        compile(stats.mtime);
                    } else {
                        send(obj.source);
                    }
                } else {
                    compile(stats.mtime);
                }
            });
        }
    };
}
