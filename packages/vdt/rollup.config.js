var commonjs = require('rollup-plugin-commonjs');
var nodeResolve = require('rollup-plugin-node-resolve');
var replace = require('rollup-plugin-replace');
var babel = require('rollup-plugin-babel');

module.exports = {
    entry: 'src/client.js',
    dest: 'dist/vdt.esm.js',
    format: 'cjs',
    external: ['fs', 'path', 'url'],
    legacy: true,
    plugins: [
        babel({
            // exclude: 'node_modules/**',
            presets: [
                ['es2015', {"modules": false, "loose": true}]
            ],
            plugins: [
                "external-helpers",
                // "minify-constant-folding",
                // "transform-es3-property-literals",
                // "transform-es3-member-expression-literals",
            ],
            babelrc: false
        }),
        nodeResolve({module: true, jsnext: true, main: true, browser: true}),
        commonjs(),
        // replace({
            // 'process.env.NODE_ENV': JSON.stringify('production')
        // })
    ]
};
