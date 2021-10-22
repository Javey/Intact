import {currentInstance, Component} from './component';
import {throwError} from 'intact-shared';
import {Props} from 'misstime';

export type WatchOptions = {
    inited?: boolean,
    presented?: boolean,
}

export function watch<P, K extends keyof Props<P, Component<P>>>(
    key: K,
    callback: (newValue: Props<P, Component<P>>[K], oldValue: Props<P, Component<P>>[K] | undefined) => void,
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
                oldValue: Props<P, Component<P>>[K] | undefined,
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
                oldValue: Props<P, Component<P>>[K] | undefined,
                init: boolean
            ) => {
                let lifecycle = init ? '$mounted' : '$updated';
                const fn = () => {
                    instance!.off(lifecycle, fn);
                    callback(newValue, oldValue);
                };
                instance!.on(lifecycle, fn);
            });
        } else {
            instance!.on(`$receive:${key}`, (
                newValue: Props<P, Component<P>>[K],
                oldValue: Props<P, Component<P>>[K] | undefined,
                init: boolean
            ) => {
                if (!init) {
                    const fn = () => {
                        instance!.off('$updated', fn);
                        callback(newValue, oldValue);
                    };
                    instance!.on('$updated', fn); 
                }
            });
        }
    }
}

