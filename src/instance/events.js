import Intact from './constructor';
import {each, extend} from '../utils';

Intact.prototype.on = function(name, callback, options = {}) {
    // the event which write in template must insert before which add in self component
    (this._events[name] || (this._events[name] = []))[
        options.unshift ? 'unshift' : 'push'
    ](callback);

    // save the kept event
    if (options.keep) {
        (this._keptEvents[name] || (this._keptEvents[name] = [])).push(callback);
    }

    return this;
};

Intact.prototype.one = function(name, callback) {
    const fn = (...args) => {
        callback.apply(this, args); 
        this.off(name, fn);
    };
    this.on(name, fn);

    return this;
};

Intact.prototype.off = function(name, callback) {
    if (name === undefined) {
        this._events = extend({}, this._keptEvents);
        return this;
    }

    let callbacks = this._events[name];
    if (!callbacks) return this;

    if (callback === undefined) {
        delete this._events[name];
        return this;
    }

    for (let cb, i = 0; i < callbacks.length; i++) {
        cb = callbacks[i];
        if (cb === callback) {
            callbacks.splice(i, 1);
            // i--;
            break;
        }
    }

    return this;
};

Intact.prototype.trigger = function(name, ...args) {
    let callbacks = this._events[name];

    if (callbacks) {
        callbacks = callbacks.slice();
        for (let i = 0, l = callbacks.length; i < l; i++) {
            callbacks[i].apply(this, args);
        }
    }

    return this;
};
