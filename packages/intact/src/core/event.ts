import {Props} from 'misstime';
import {isUndefined, throwError, isFunction} from 'intact-shared';

export class Event<P> {
    private $events: Record<string, Function[] | undefined> = {}; 

    // internal properties
    public $blockAddEvent: boolean = false;

    // on<K extends Extract<keyof P, string>>(name: `$receive:${K}`, callback: (newValue: P[K], oldValue: P[K] | undefined) => void): void;
    // on<K extends Extract<keyof P, string>>(name: `$change:${K}`, callback: (newValue: P[K], oldValue: P[K]) => void): void;
    // on<K extends Extract<keyof P, string>>(name: `$changed:${K}`, callback: (newValue: P[K], oldValue: P[K]) => void): void;
    // @ts-ignore if we use generic type, we can not get expected type check when use Extract<keyof P, string>
    on<K extends keyof Props<P>>(name: `$receive:${K}`, callback: (newValue: Props<P>[K], oldValue: Props<P>[K] | undefined) => void): void;
    // @ts-ignore
    on<K extends keyof Props<P>>(name: `$change:${K}`, callback: (newValue: Props<P>[K], oldValue: Props<P>[K]) => void): void;
    // @ts-ignore
    on<K extends keyof Props<P>>(name: `$changed:${K}`, callback: (newValue: Props<P>[K], oldValue: Props<P>[K]) => void): void;
    on(name: string, callback: Function): void;
    on(name: string, callback: Function) {
        if (process.env.NODE_ENV !== 'production') {
            if (this.$blockAddEvent) {
                throwError(
                    'Adding event listener on `beforeUpdate` & `updated` is not allowed, ' + 
                    'because it may invoke multiple times. ' + 
                    'You should add it on `init`.'
                );
            }
            if (!isFunction(callback)) {
                throwError('Expect a function, but got ' + JSON.stringify(callback));
            }
        }
        const events = this.$events;
        (events[name] || (events[name] = [])).push(callback);
    }

    off(name?: string, callback?: Function) {
        if (isUndefined(name)) {
            this.$events = {};
            return;
        }

        const callbacks = this.$events[name];

        if (isUndefined(callbacks)) return;

        if (isUndefined(callback)) {
            this.$events[name] = undefined;
            return;
        }

        for (let i = 0; i < callbacks.length; i++) {
            if (callbacks[i] === callback) {
                callbacks.splice(i, 1);
                break;
            }
        }
    }

    trigger(name: string, args: any[]) {
        let callbacks = this.$events[name];

        if (!isUndefined(callbacks)) {
            callbacks = callbacks.slice();
            for (let i = 0; i < callbacks.length; i++) {
                callbacks[i].apply(void 0, args);
            }
        }
    }
}
