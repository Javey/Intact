import {Component} from '../src/core/component';

interface AProps {
    a: string
    aa: boolean
}

class AA extends Component<AProps> {
    init() {
        this.set('a', 'a');
        this.set('b', 1);
        // @ts-expect-error
        this.set('a', 1);
        this.set({a: 'a'});
        this.set({a: 'a', b: 1});
        // @ts-expect-error
        this.set({a: 1});
        // @ts-expect-error
        this.set({a: 1, b: 1});
    }
}

class A<T extends AProps> extends Component<T> {
    static defaults: Partial<AProps> = {
        a: 'a' 
    };

    init() {
        this.set('a', 'a');
        this.set('b' as any, 1);
        // @ts-expect-error
        this.set('a', 1);
        this.set({a: 'a'});
        this.set({a: 'a', b: 1} as any);
        // @ts-expect-error
        this.set({a: 1});

        expectType<string>(this.get('a'));
        expectType<any>(this.get('b'));

        this.watch('a', (v, o) => {
            expectType<string>(v); 
            expectType<string | undefined>(o);
        });

        this.on('$change:a', (v, o) => {
            expectType<string>(v); 
        });
    }
}

interface BProps extends AProps {
    b: number 
}
export class B<T extends BProps> extends A<T> {
    static defaults: Partial<BProps> = {
        ...A.defaults,
        b: 1,
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
    }
}

function expectType<T>(value: T): void { }
