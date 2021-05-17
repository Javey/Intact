// @reference from vue3.0
import {currentInstance} from './component';
import {throwError, isUndefined, error} from 'intact-shared';
import {InjectionKey} from '../utils/types';

export function provide<T>(key: InjectionKey, value: T) {
    if (process.env.NODE_ENV !== 'production') {
        if (!currentInstance) {
            throwError('provide() can only be used inside init()');
        }
    }

    let provides = currentInstance!.$provides;

    if (provides === null) {
        provides = currentInstance!.$provides = Object.create(null);
    } else {
        const parent = currentInstance!.$parent;
        const parentProvides = parent && parent.$provides;
        if (provides === parentProvides) {
            provides = currentInstance!.$provides = Object.create(parentProvides);
        }
    }

    provides![key as string] = value;
}

export function inject<T>(key: InjectionKey, defaultValue?: T): T | undefined {
    if (process.env.NODE_ENV !== 'production') {
        if (!currentInstance) {
            throwError('inject() can only be used inside init()');
        }
    }

    const parent = currentInstance!.$parent;
    const provides = parent && parent.$provides; 

    if (provides && key in provides) {
        return provides[key as string];
    } else if (!isUndefined(defaultValue)) {
        return defaultValue;
    } else if (process.env.NODE_ENV !== 'production') {
        error(`injection "${key as string}" not found.`);
    }
}
