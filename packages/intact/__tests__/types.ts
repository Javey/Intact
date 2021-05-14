import {Component} from '../src/core/component';

interface AProps {
    a: string
}

class A<T extends AProps> extends Component<T> {
    static defaults: Partial<AProps> = {
        a: 'a' 
    };

    init() {
        this.set({a: 'a'});
        this.set('a', 'a');
        this.get('a');

        // @ts-expect-error
        this.get('b');

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
        this.set({a: 'a'});
        this.set('a', 'a');
        this.get('a');
        this.set('b', 1);
        this.set({b: 1});
        this.get('b');

        // @ts-expect-error
        this.get('c');

        this.on('$change:a', (v, o) => {

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

function expectType<T>(value: T): void {

}
