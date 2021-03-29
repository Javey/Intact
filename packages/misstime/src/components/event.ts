import {isUndefined} from '../utils/helpers';

export class Event {
    private $events: Record<string, Function[]> = {}; 

    protected on(name: string, callback: Function) {
        const events = this.$events;
        (events[name] || (events[name] = [])).push(callback);
    }

    protected one(name: string, callback: Function) {
        const fn = (...args: any[]) => {
            callback.apply(this, args);
            this.off(name, fn);
        }
        this.on(name, fn);
    }

    protected off(name?: string, callback?: Function) {
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

    protected trigger(name: string, ...args: any[]) {
        let callbacks = this.$events[name];

        if (!isUndefined(callbacks)) {
            callbacks = callbacks.slice();
            for (let i = 0; i < callbacks.length; i++) {
                callbacks[i].apply(this, args);
            }
        }
    }
}
