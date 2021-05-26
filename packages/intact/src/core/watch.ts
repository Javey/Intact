import {currentInstance, Component} from './component';
import {throwError, isUndefined, error} from 'intact-shared';
import {Props} from 'misstime';

export function watch<P, K extends keyof Props<P, Component<P>>>(
    key: K,
    callback: (newValue: Props<P, Component<P>>[K], oldValue: Props<P, Component<P>>[K] | undefined) => void,
    instance: Component<P> | null = currentInstance,
) {
    if (process.env.NODE_ENV !== 'production') {
        if (!instance) {
            throwError('watch() can only be used inside init()');
        }
    }

    instance!.on(`$change:${key}`, callback);
    instance!.on(`$receive:${key}`, callback);
}

