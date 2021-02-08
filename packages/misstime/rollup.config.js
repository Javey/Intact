const babel = require('rollup-plugin-babel');
const replace = require('rollup-plugin-replace');

const config = {
    entry: 'src/index.js',
    plugins: [
        babel({
            exclude: 'node_modules/**',
            presets: [
                ['es2015', {"modules": false, "loose": true}]
            ],
            plugins: [
                "external-helpers",
                "minify-constant-folding",
                "transform-es3-property-literals",
                "transform-es3-member-expression-literals",
            ],
            babelrc: false
        })
    ]
};


module.exports = [
    Object.assign({}, config, {
        dest: 'dist/misstime.js',
        format: 'umd',
        moduleName: 'misstime',
        legacy: true,
    }),
    Object.assign({}, config, {
        dest: 'dist/index.js',
        format: 'cjs'
    }),
];
