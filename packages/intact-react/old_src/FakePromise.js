// make sure all mount/update lifecycle methods of children have completed
export default class FakePromise {
    static all = function(promises) {
        let resolvedCount = 0;
        let callbacks = promises.callbacks || (promises.callbacks = []);
        let resolved = false;
        let done = false;

        promises.forEach(p => {
            if (p._hasRewrite) return;
            p._hasRewrite = true;
            p.then(then)
        });

        if (!promises._hasRewrite) {
            // console.error('last promises has not been done')
            const push = promises.push;
            promises.push = function(p) {
                p.then(then);
                push.call(promises, p);
            };
            promises.push.push = push;
            promises._hasRewrite = true;
        }

        function _cb() {
            // clear array
            promises.length = 0;
            promises.push = promises.push.push;
            promises._hasRewrite = false;
            promises.callbacks = [];
            let cb;
            while (cb = callbacks.shift()) {
                cb();
            }
        }

        function then() {
            resolvedCount++;
            if (promises.length === resolvedCount) {
                resolved = true;
                if (done) {
                    return console.error('promise has done');
                }
                if (callbacks.length) {
                    done = true;
                    _cb();
                }
            }
        }


        return {
            then(cb) {
                callbacks.push(cb);
                if (!promises.length || resolved) {
                    _cb();
                }
            }
        };
    };

    constructor(callback) {
        this.resolved = false;
        this.callbacks = [];
        callback.call(this, () => this.resolve());
    }

    resolve() {
        this.resolved = true;
        let cb;
        while (cb = this.callbacks.shift()) {
            cb();
        }
    }

    then(cb) {
        this.callbacks.push(cb);
        if (this.resolved) {
            this.resolve();
        }
    }
}
