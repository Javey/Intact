import {isUndefined, throwError, isFunction} from '../utils/helpers';

type World = "world";

type Greeting = `hello ${World}`;

export class Event<P> {
    private $events: Record<string, Function[]> = {}; 

    // internal properties
    public $blockAddEvent: boolean = false;

    on<K extends Extract<keyof P, string>>(name: `$receive:${K}`, callback: (newValue: P[K], oldValue: P[K] | undefined) => void): void;
    on<K extends Extract<keyof P, string>>(name: `$change:${K}`, callback: (newValue: P[K], oldValue: P[K]) => void): void;
    on<K extends Extract<keyof P, string>>(name: `$changed:${K}`, callback: (newValue: P[K], oldValue: P[K]) => void): void;
    on(name: string, callback: Function): void;
    on(name: string, callback: Function) {
        if (process.env.NODE_ENV !== 'production') {
            if (this.$blockAddEvent) {
                throwError(
                    'Adding event listener on `beforeUpdate` & `updated` is not allowed, ' + 
                    'because it may invoke multiple times.' + 
                    'Add it on `init`.'
                );
            }
            if (!isFunction(callback)) {
                throwError('Expect a function, but got ' + JSON.stringify(callback));
            }
        }
        const events = this.$events;
        (events[name] || (events[name] = [])).push(callback);
    }

    one(name: string, callback: Function) {
        const fn = (...args: any[]) => {
            callback.apply(this, args);
            this.off(name, fn);
        }
        this.on(name, fn);
    }

    off(name?: string, callback?: Function) {
        if (isUndefined(name)) {
            this.$events = {};
            return;
        }

        const callbacks = this.$events[name];

        if (isUndefined(callbacks)) return;

        if (isUndefined(callback)) {
            delete this.$events[name];
            return;
        }

        for (let i = 0; i < callbacks.length; i++) {
            if (callbacks[i] === callback) {
                callbacks.splice(i, 1);
                break;
            }
        }
    }

    trigger(name: string, ...args: any[]) {
        let callbacks = this.$events[name];

        if (!isUndefined(callbacks)) {
            callbacks = callbacks.slice();
            for (let i = 0; i < callbacks.length; i++) {
                callbacks[i].apply(this, args);
            }
        }
    }
}
