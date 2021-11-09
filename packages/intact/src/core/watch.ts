import {currentInstance, Component} from './component';
import {throwError} from 'intact-shared';
import {Props} from 'misstime';
import {LifecycleEvents, ChangeCallback} from '../utils/types';

export type WatchOptions = {
    inited?: boolean,
    presented?: boolean,
}

export function watch<P, K extends keyof Props<P>>(
    key: K,
    callback: ChangeCallback<Props<P>, K>,
    options?: WatchOptions,
    instance: Component<P> | null = currentInstance 
) {
    if (process.env.NODE_ENV !== 'production') {
        if (!instance) {
            throwError('watch() can only be used inside init()');
        }
    }

    if (!options || !options.presented) {
        instance!.on(`$change:${key}` as `$change:${string & K}`, callback);
        if (!options || !options.inited) {
            instance!.on(`$receive:${key}` as `$receive:${string & K}`, callback);
        } else {
            instance!.on(`$receive:${key}` as `$receive:${string & K}`, (newValue, oldValue, init) => {
                if (!init) {
                    callback(newValue, oldValue);
                }
            });
        }
    } else {
        instance!.on(`$changed:${key}` as `$changed:${string & K}`, callback);
        if (!options.inited) {
            instance!.on(`$receive:${key}` as `$receive:${string & K}`, (newValue, oldValue, init) => {
                let lifecycle: keyof LifecycleEvents<any> = init ? '$mounted' : '$updated';
                const fn = () => {
                    (instance!.off as Function)(lifecycle, fn);
                    callback(newValue, oldValue);
                };
                instance!.on(lifecycle, fn);
            });
        } else {
            instance!.on(`$receive:${key}` as `$receive:${string & K}`, (newValue, oldValue, init) => {
                if (!init) {
                    const fn = () => {
                        (instance!.off as Function)('$updated', fn);
                        callback(newValue, oldValue);
                    };
                    instance!.on('$updated', fn); 
                }
            });
        }
    }
}

