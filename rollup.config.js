var commonjs = require('rollup-plugin-commonjs'),
    nodeResolve = require('rollup-plugin-node-resolve'),
    replace = require('rollup-plugin-replace'),
    babel = require('rollup-plugin-babel');

module.exports = {
    entry: 'src/index.js',
    dest: 'dist/intact.js',
    format: 'umd',
    moduleName: 'Intact',
    legacy: true,
    plugins: [
        babel({
            presets: [
                ['es2015', {modules: false, loose: true}]
            ],
            plugins: [
                'external-helpers'
            ],
            babelrc: false
        }),
        nodeResolve({module: true}),
        commonjs(),
        replace({
            'process.env.NODE_ENV': "'production'"
        })
    ]
};
