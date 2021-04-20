import {matchSnapshot} from 'chai-karma-snapshot';

chai.use(matchSnapshot);

function requireAll(r) {
    r.keys().forEach(r);
}

requireAll(require.context('../packages/misstime/__tests__'), true, /\.ts$/);
// requireAll(require.context('../packages/vdt/__tests__'), true, /\.ts$/);
