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
    options?: WatchOptions
) {
    if (process.env.NODE_ENV !== 'production') {
        if (!currentInstance) {
            throwError('watch() can only be used inside init()');
        }
    }

    if (!options || !options.presented) {
        currentInstance!.on(`$change:${key}`, callback);
        if (!options || !options.inited) {
            currentInstance!.on(`$receive:${key}`, callback);
        } else {
            currentInstance!.on(`$receive:${key}`, (
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
        const instance = currentInstance!;
        instance.on(`$changed:${key}`, callback);
        if (!options.inited) {
            instance.on(`$receive:${key}`, (
                newValue: Props<P, Component<P>>[K],
                oldValue: Props<P, Component<P>>[K] | undefined,
            ) => instance.$mountedQueue!.push(() => callback(newValue, oldValue)));
        } else {
            instance.on(`$receive:${key}`, (
                newValue: Props<P, Component<P>>[K],
                oldValue: Props<P, Component<P>>[K] | undefined,
                init: boolean
            ) => {
                if (!init) {
                    instance.$mountedQueue!.push(() => callback(newValue, oldValue));
                }
            });
        }
    }
}

