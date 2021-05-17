// @reference from vue3.0
import {currentInstance} from './component';
import {throwError} from 'intact-shared';

export function provide<T>(key: any, value: T) {
    if (process.env.NODE_ENV !== 'production') {
        if (!currentInstance) {
            throwError('provide() can only be used inside init()');
        }
    }

    let provides = currentInstance!.provides;
    const parentProvides = currentInstance!.$parent && currentInstance!.$parent.provides;
}

