suite('defaults', () => {
    const defaultsFn = () => {
        return {
            a: 1,
            b: 2,
        };
    };

    const defaultsObj = {
        a: 1,
        b: 2,
    };

    benchmark('return object', () => {
        const props = defaultsFn();
    });

    benchmark('merge object', () => {
        const props = {};
        for (let key in defaultsObj) {
            props[key] = defaultsObj[key];
        }
    });
});

