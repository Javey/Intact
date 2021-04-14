// suite('undefined vs void 0', () => {
    // benchmark('undefined', () => {
        // var a;
        // a === undefined;
    // });

    // benchmark('void 0', () => {
        // var a;
        // a === void 0;
    // });
// });

// suite('detect property', () => {
    // const a = {a: 1, b: 1, c: 'c'};
    // const hasOwn = Object.prototype.hasOwnProperty;

    // benchmark('undefined', () => {
        // a.d === undefined;
    // });

    // benchmark('void 0', () => {
        // a.d === void 0;
    // });

    // benchmark('in', () => {
        // 'd' in a;
    // });

    // benchmark('hasOwnProperty', () => {
        // hasOwn.call(a, 'd');
    // });
// });

suite('if (undefined) vs if (undefined === undefined)', () => {
    const a = undefined;

    benchmark('if (undefined)', () => {
        if (a) { }
    });

    benchmark('if (isUndefined(undefined))', () => {
        if (isUndefined(a)) {  }
    });
});

function isUndefined(a) {
    return a === void 0;
}

// suite('diff two objects', () => {
    // const a = {a: 1, b: 1, c: 1};
    // const b = {a: 2, b: 1, d: 1};

    // benchmark('for', () => {
        // for (const prop in b) {
            // const lastValue = a[prop];
            // const nextValue = b[prop];
            // if (lastValue !== nextValue) {
                // console.log('a');
            // }
        // }

        // for (const prop in a) {
            // if (!(prop in b) && a[prop] !== undefined) {
                // console.log('a');
            // }
        // }
    // });

    // benchmark('array', () => {
        // const keys = [];
        // for (const prop in b) {
            // const lastValue = a[prop];
            // const nextValue = b[prop];
            // if (lastValue !== nextValue) {
                // keys.push(prop);
                // console.log('a');
            // }
        // }
    // });
// });
