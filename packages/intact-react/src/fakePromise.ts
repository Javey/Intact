type Callback = () => void;
type Executor = (resolve: () => void) => void;

export class FakePromise {
    static all(promises: FakePromises) {
        const callbacks: Callback[] = [];
        let resolved = false;
        let resolvedCount = 0;

        promises.then = isAllPromisesResolved;

        promises.value.forEach(promise => {
            promise.then(isAllPromisesResolved);
        });

        function callCallback() {
            let cb;
            while (cb = callbacks.shift()) {
                cb();
            }
        }

        function isAllPromisesResolved() {
            resolvedCount++;
            if (promises.value.length === resolvedCount) {
                resolved = true;
                callCallback();
            }
        }

        return {
            then(cb: Callback) {
                callbacks.push(cb); 
                if (!promises.value.length || resolved) {
                    callCallback(); 
                }

                return this;
            }
        }
    }

    private resolved = false;
    private callbacks: Callback[] = [];

    constructor(executor: Executor) {
        executor(this.resolve.bind(this)); 
    }

    public then(cb: Callback) {
        this.callbacks.push(cb);
        if (this.resolved) {
            this.resolve();
        }
    }

    private resolve() {
        this.resolved = true;
        let cb;
        while (cb = this.callbacks.shift()) {
            cb();
        }
    }
}

export class FakePromises {
    public value: FakePromise[] = [];
    public then!: Callback;

    public add(promise: FakePromise) {
        this.value.push(promise);
        promise.then(this.then);
    }
}
