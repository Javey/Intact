const {rollup, generate} = require('rollup');
const {join, resolve} = require('path');
const typescript = require('rollup-plugin-typescript2');
const replace = require('@rollup/plugin-replace');
const {terser} = require('rollup-plugin-terser');
const fs = require('fs');

const cwd = process.cwd();
const pkgJson = require(join(cwd, 'package.json'));
const options = require('minimist')(process.argv.slice(2), {
    boolean: ['minify', 'replace'],
    default: {
        env: 'development',
        ext: 'js',
        format: 'umd',
        name: pkgJson.name,
        minify: true,
        replace: true,
        version: pkgJson.version,
        entry: 'src/index.ts',
    }
});
const resolveRoot = path => resolve(__dirname, '../',  path);
const plugins = [
    typescript({
        tsconfig: resolve(__dirname, '../tsconfig.json'),
        exclude: ['**/__tests__'],
        cacheRoot: resolveRoot(`node_modules/.rpt2_cache/${pkgJson.name}_${options.env}_${options.format}`),
        tsconfigOverride: {
            compilerOptions: {
                declaration: true,
                // declarationMap: true,
                sourceMap: false,
            }
        }
    }),
];

const replaceValues = {
    '/** @class */': '/*#__PURE__*/ /** @class */', // for tree-shaking
};
if (options.replace) {
    replaceValues['process.env.NODE_ENV'] = JSON.stringify(options.env);
}
plugins.push(replace({
    values: replaceValues,
    preventAssignment: true,
    delimiters: ['', ''],
}));

if (options.minify) {
    plugins.push(terser({
        compress: {
            passes: 5,
        },
        mangle: {
            toplevel: true,
        },
        parse: {
            html5_comments: false,
            shebang: false,
        },
        format: {
            comments: false,
        }
    }));
}

const format = options.format;
const external = format === 'umd' ||
    format === 'iife' ||
    format === 'es' && options.env !== 'unknown' ?
        [] :
        Object.keys({...pkgJson.dependencies, 'vdt/runtime': true});

const name = pkgJson.name.replace(/(^\w)|(-\w)/g, v => v.charAt(v.length - 1).toUpperCase());
const input = join(cwd, options.entry);

async function build() {
    if (!fs.existsSync(input)) return;

    const buddle = await rollup({input, external, plugins});

    await buddle.write({
        file: `dist/${options.name}.${options.ext}`,
        format,
        name,
    });

    // const {Extractor, ExtractorConfig} = require('@microsoft/api-extractor');
    // const extractorConfigPath = resolve(cwd, 'api-extractor.json');
    // const extractorConfig = ExtractorConfig.loadFileAndPrepare(extractorConfigPath);
    // const extractorResult = Extractor.invoke(extractorConfig, {
        // localBuild: true,
        // showVerboseMessages: true,
        // typescriptCompilerFolder: resolveRoot('node_modules/typescript'),
    // });
}

build();
