import {set, get} from '../../src/utils/helpers';

describe('Component', () => {
    describe('Helpers', () => {
        it('should set by key', () => {
            const props = {a: 1};
            const changeTraces = set(props, 'a', 2);

            expect(props).toEqual({a: 2});
            expect(changeTraces).toEqual([{path: 'a', changes: [2, 1]}]);
        });

        it('should set by path', () => {
            const props = {a: {b: 1}};
            const changeTraces = set(props, 'a.b', 2);

            expect(props).toEqual({a: {b: 2}});
            expect(changeTraces).toEqual([
                {path: 'a', changes: [{b: 2}, {b: 1}]},
                {path: 'a.b', changes: [2, 1]},
            ]);
        });

        it('should set by path that does not exist', () => {
            const props = {a: {b: 1}};
            const changeTraces = set(props, 'a.c.d', 2);

            expect(props).toEqual({a: {b: 1, c: {d: 2}}} as any);
            expect(changeTraces).toEqual([
                {path: 'a', changes: [{b: 1, c: {d: 2}}, {b: 1}]},
                {path: 'a.c', changes: [{d: 2}, undefined]},
                {path: 'a.c.d', changes: [2, undefined]},
            ]);
        });
    });
});
