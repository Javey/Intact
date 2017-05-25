var commonjs = require('rollup-plugin-commonjs'),
    nodeResolve = require('rollup-plugin-node-resolve'),
    babel = require('rollup-plugin-babel');

module.exports = {
    entry: 'src/index.js',
    dest: 'dist/index.js',
    format: 'cjs',
    legacy: true,
    // external: ['vdt'],
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
        nodeResolve({module: true, jsnext: true, main: true, browser: true}),
        commonjs(),
    ]
};
