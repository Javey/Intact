import type {Component} from './component';
import {Props} from 'misstime';
import {isUndefined, throwError, isFunction} from 'intact-shared';
import {ChangeCallback, ReceiveCallback, EventCallback} from '../utils/types';

type Events<P extends {}, E> = {
    [Key in keyof Props<P> as 
        | `$change:${string & Key}`
        | `$changed:${string & Key}`
    ]?: ChangeCallback<Props<P>, Key>[]
} & {
    [Key in keyof Props<P> as
        | `$receive:${string & Key}`
    ]?: ReceiveCallback<Props<P>, Key>[]
} & {
    [Key in keyof E]?: E[Key][]
};

export class Event<
    P extends {},
    E extends {},
    L extends {},
> {
    private $events: Events<P, E> = {} as any;

    // internal properties
    public $blockAddEvent: boolean = false;

    // props
    on<K extends keyof Props<P>>(name: `$receive:${string & K}`, callback: ReceiveCallback<Props<P>, K>): void;
    on<K extends keyof Props<P>>(name: `$change:${string & K}`, callback: ChangeCallback<Props<P>, K>): void;
    on<K extends keyof Props<P>>(name: `$changed:${string & K}`, callback: ChangeCallback<Props<P>, K>): void;
    // events
    on<K extends keyof E>(name: K, callback: (...args: E[K] extends any[] ? E[K] : never) => void): void;
    on<K extends keyof L>(name: K, callback: L[K]): void;
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
        const events = this.$events as any;
        (events[name] || (events[name] = [])).push(callback);
    }

    off<K extends keyof Events<P, E>>(name?: K, callback?: Function) {
        if (isUndefined(name)) {
            this.$events = {};
            return;
        }

        const callbacks = this.$events[name] as any;

        if (isUndefined(callbacks)) return;

        if (isUndefined(callback)) {
            (this.$events as any)[name] = undefined;
            return;
        }

        for (let i = 0; i < callbacks.length; i++) {
            if (callbacks[i] === callback) {
                callbacks.splice(i, 1);
                break;
            }
        }
    }

    // trigger<N = void, T extends (...args: any[]) => void = any>(name: NoInfer<N>, ...args: Parameters<T>): void;
    trigger<K extends keyof E>(name: K, ...args: any[] & E[K]) {
        let callbacks = this.$events[name] as any;

        if (!isUndefined(callbacks)) {
            callbacks = callbacks.slice();
            for (let i = 0; i < callbacks.length; i++) {
                callbacks[i].apply(void 0, args);
            }
        }
    }
}
