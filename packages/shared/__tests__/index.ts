import {get, set} from '../src/index';

describe('Intact Shared', () => {
    it('should set by key', () => {
        const props = {a: 1};
        const changeTraces = set(props, 'a', 2);

        expect(props).to.eql({a: 2});
        expect(changeTraces).to.eql([{path: 'a', newValue: 2, oldValue: 1}]);
    });

    it('should set by path', () => {
        const props = {a: {b: 1}};
        const changeTraces = set(props, 'a.b', 2);

        expect(props).to.eql({a: {b: 2}});
        expect(changeTraces).to.eql([
            {path: 'a', newValue: {b: 2}, oldValue: {b: 1}},
            {path: 'a.b', newValue: 2, oldValue: 1},
        ]);
    });

    it('should set by path that does not exist', () => {
        const props = {a: {b: 1}};
        const changeTraces = set(props, 'a.c.d', 2);

        expect(props).to.eql({a: {b: 1, c: {d: 2}}} as any);
        expect(changeTraces).to.eql([
            {path: 'a', newValue: {b: 1, c: {d: 2}}, oldValue: {b: 1}},
            {path: 'a.c', newValue: {d: 2}, oldValue: undefined},
            {path: 'a.c.d', newValue: 2, oldValue: undefined},
        ]);
    });
});

