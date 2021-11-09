import {Component} from '../src/core/component';
import {UnknownKey, WithUnknownKey} from '../src/utils/types';
import {Children} from 'misstime';

interface AProps {
    a: string
    aa: boolean
}

interface AEvents {
    a: []
    b: [number]
}

// type Test = AEvents & {
//     a: 1
// }
// interface Test extends AEvents {
    // b: () => void
// }

class AA extends Component<AProps, AEvents> {
    static defaults(): Partial<AProps> {
        return {a: 'a', aa: true}
    }

    init() {
        expectType<number>(this.get<number>('ab'));
        expectType<string>(this.get<string>('ab'));
        // @ts-expect-error
        this.get('ab');
        // this.get<number>('a')
        
        this.set('a', 'a');
        // @ts-expect-error
        this.set('a', 1);

        // @ts-expect-error
        this.set('b', 1);
        this.set<number>('b', 1);
        // @ts-expect-error
        this.set<number>('b', 'a');
        this.set<{b: number}>('b', 1);
        // @ts-expect-error
        this.set<{b: number}>('b', 'b');
        
        this.set({a: 'a'});
        // @ts-expect-error
        this.set({a: 'a', b: 1});
        this.set<{b: number}>({a: 'a', b: 1});
        // @ts-expect-error
        this.set<{b: number}>({a: 1, b: 1});
        // @ts-expect-error
        this.set({a: 1});
        // @ts-expect-error
        this.set({a: 1, b: 1});

        // @ts-expect-error
        this.trigger('error');
        this.trigger('a');
        // @ts-expect-error
        this.trigger('a', 1);
        // @ts-expect-error
        this.trigger('b');
        // @ts-expect-error
        this.trigger('b', '1');
        this.trigger('b', 1);
    }
}

class A<T extends AProps, E extends AEvents> extends Component<T, E> {
    static defaults = (): Partial<AProps> => {
        return {
            a: 'a',
        };
    };

    init() {
        this.set('a', 'a');
        // @ts-expect-error
        this.set('b', 1);
        this.set<{b: number}>('b', 1);
        // @ts-expect-error
        this.set('a', 1);
        this.set({a: 'a'});
        this.set<Partial<AProps> &{b: number}>({a: 'a', b: 1});
        this.set<{a: string, b: number}>({a: 'a', b: 1});
        // @ts-expect-error
        this.set<Partial<AProps> & {b: number}>({a: 'a', b: 'b'});
        // @ts-expect-error
        this.set<Partial<AProps> & {b: number}>({a: 1, b: 1});
        // @ts-expect-error
        this.set({a: 1});

        // @ts-expect-error
        this.get('ab');
        expectType<string>(this.get('a'));
        expectType<number>(this.get<number>('b'));

        this.watch('a', (v, o) => {
            expectType<string>(v); 
            expectType<string | undefined>(o);
        });

        this.on('$change:a', (v, o) => {
            expectType<string>(v); 
        });

        this.on('$receive:children', vNodes => {
            expectType<Children>(vNodes);
        });

        (['a', 'aa'] as const).forEach(name => {
            this.on(`$change:${name}` as const, () => { });
        });
        
        // @ts-expect-error
        this.on('$change:xx', (v, o) => { });

        // @ts-expect-error
        this.trigger('error');
        this.trigger('a');
        // @ts-expect-error
        this.trigger('a', 1);
        // @ts-expect-error
        this.trigger('b');
        // @ts-expect-error
        this.trigger('b', '1');
        this.trigger('b', 1);
    }
}

interface BProps extends AProps {
    b: number 
}
interface BEvents extends AEvents {
    c: [string, string?]
}
export class B<T extends BProps, E extends BEvents> extends A<T, E> {
    static defaults(): Partial<BProps> {
        return {
            ...A.defaults(),
            b: 1,
        }
    }

    init() {
        this.set('a', 'a');
        this.set('b', 1);
        // @ts-expect-error
        this.set('c', 1);
        this.set('c' as any, 1);
        // @ts-expect-error
        this.set('b', 'b');

        this.set({a: 'a'});
        this.set({b: 1});

        expectType<string>(this.get('a'));
        expectType<number>(this.get('b'));
        expectType<any>(this.get('c'));

        this.on('$change:a', (v, o) => {
            expectType<string>(v); 
        });

        this.watch('b', (v, o) => {
            expectType<number>(v); 
            expectType<number | undefined>(o);
        });
        
        this.on('$change:b', (v, o) => {
            expectType<number>(v); 
        });

        // @ts-expect-error
        this.trigger('error');
        this.trigger('a');
        // @ts-expect-error
        this.trigger('a', 1);
        // @ts-expect-error
        this.trigger('b');
        // @ts-expect-error
        this.trigger('b', '1');
        this.trigger('b', 1);
        // @ts-expect-error
        this.trigger('c');
        // @ts-expect-error
        this.trigger('c', 1);
        this.trigger('c', '1');
        this.trigger('c', '1', '1');
    }
}

function expectType<T>(value: T): void { }
