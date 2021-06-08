import {matchSnapshot} from 'chai-karma-snapshot';

chai.use(matchSnapshot);

function requireAll(r: __WebpackModuleApi.RequireContext) {
    r.keys().forEach(r);
}

requireAll(require.context('../packages/misstime/__tests__', true, /\.ts$/));
requireAll(require.context('../packages/compiler/__tests__', true, /\.ts$/));
requireAll(require.context('../packages/vdt/__tests__', true, /\.ts$/));
requireAll(require.context('../packages/intact/__tests__', true, /\.ts$/));
