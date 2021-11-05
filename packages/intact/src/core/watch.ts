import {currentInstance, Component} from './component';
import {throwError} from 'intact-shared';
import {Props} from 'misstime';
import { LifecycleEvents } from '../utils/types';

export type WatchOptions = {
    inited?: boolean,
    presented?: boolean,
}

export function watch<P, K extends keyof Props<P>>(
    key: K,
    callback: (newValue: Props<P>[K], oldValue: Props<P>[K]) => void,
    options?: WatchOptions,
    instance = currentInstance
) {
    if (process.env.NODE_ENV !== 'production') {
        if (!instance) {
            throwError('watch() can only be used inside init()');
        }
    }

    if (!options || !options.presented) {
        instance!.on(`$change:${key}`, callback);
        if (!options || !options.inited) {
            instance!.on(`$receive:${key}`, callback);
        } else {
            instance!.on(`$receive:${key}`, (
                newValue: Props<P, Component<P>>[K],
                oldValue: Props<P, Component<P>>[K],
                init: boolean
            ) => {
                if (!init) {
                    callback(newValue, oldValue);
                }
            });
        }
    } else {
        instance!.on(`$changed:${key}`, callback);
        if (!options.inited) {
            instance!.on(`$receive:${key}`, (
                newValue: Props<P, Component<P>>[K],
                oldValue: Props<P, Component<P>>[K],
                init: boolean
            ) => {
                let lifecycle: keyof LifecycleEvents<any> = init ? '$mounted' : '$updated';
                const fn = () => {
                    (instance!.off as Function)(lifecycle, fn);
                    callback(newValue, oldValue);
                };
                instance!.on(lifecycle, fn);
            });
        } else {
            instance!.on(`$receive:${key}`, (
                newValue: Props<P, Component<P>>[K],
                oldValue: Props<P, Component<P>>[K],
                init: boolean
            ) => {
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

