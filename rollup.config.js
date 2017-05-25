var commonjs = require('rollup-plugin-commonjs'),
    nodeResolve = require('rollup-plugin-node-resolve'),
    babel = require('rollup-plugin-babel');

module.exports = {
    entry: 'dist/index.js',
    dest: 'dist/intact.js',
    format: 'umd',
    moduleName: 'Intact',
    legacy: true,
    external: ['vdt'],
    plugins: [
        nodeResolve({jsnext: true, main: true, browser: true}),
        commonjs(),
        // babel({
            // exclude: 'node_modules/**',
            // presets: [
                // ['es2015', {modules: false}]
            // ],
            // plugins: [
                // 'external-helpers'
            // ],
            // babelrc: false
        // }),
    ]
};
