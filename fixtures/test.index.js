function requireAll(r) {
    r.keys().forEach(r);
}

requireAll(require.context('../packages/misstime/__tests__'), true, /\.ts$/);
