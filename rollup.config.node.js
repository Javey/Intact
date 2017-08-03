var commonjs = require('rollup-plugin-commonjs'),
    nodeResolve = require('rollup-plugin-node-resolve'),
    babel = require('rollup-plugin-babel');

module.exports = {
    entry: 'src/index.js',
    dest: 'dist/index.js',
    format: 'cjs',
    plugins: [
        nodeResolve({module: true, jsnext: true, main: true}),
        commonjs(),
        babel({
            // exclude: 'node_modules/**',
            presets: [
                ['es2015', {modules: false}]
            ],
            plugins: [
                'external-helpers'
            ],
            babelrc: false
        }),
    ]
};
