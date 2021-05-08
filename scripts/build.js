const {rollup, generate} = require('rollup');
const {join, resolve} = require('path');
const typescript = require('rollup-plugin-typescript2');
const replace = require('@rollup/plugin-replace');
const {terser} = require('rollup-plugin-terser');

const cwd = process.cwd();
const pkgJson = require(join(cwd, 'package.json'));
const options = require('minimist')(process.argv.slice(2), {
    boolean: ['minify'],
    default: {
        env: 'development',
        ext: 'js',
        format: 'umd',
        name: pkgJson.name,
        minify: true,
        version: pkgJson.version,
    }
});
const resolveRoot = path => resolve(__dirname, '../',  path);
const plugins = [
    typescript({
        tsconfig: resolve(__dirname, '../tsconfig.json'),
        exclude: ['**/__tests__'],
        cacheRoot: resolveRoot(`node_modules/.rpt2_cache/${pkgJson.name}_${options.env}_${options.format}`),
        tsconfigOverride: {
            declaration: true,
            sourceMap: false,
        }
    }),
    replace({
        values: {
            'process.env.NODE_ENV': JSON.stringify(options.env),
        },
        preventAssignment: true,
    }),
];

if (options.minify) {
    plugins.push(terser());
}

const external = options.format === 'umd' ? [] : Object.keys(pkgJson.dependencies || {});

const name = pkgJson.name.replace(/(^\w)|(-\w)/g, v => v.charAt(v.length - 1).toUpperCase());

async function build() {
    const buddle = await rollup({
        input: join(cwd, 'src/index.ts'),
        external,
        plugins,
    });

    await buddle.write({
        file: `dist/${options.name}.${options.ext}`,
        format: options.format,
        name,
    });
}

build();
