import {ComponentClass} from 'misstime';
import {currentInstance} from './component';
import {throwError} from 'intact-shared';
import {
    LifecycleEvents,
    MountLifecycleCallback,
    UpdateLifecycleCallback,
    UnmountLifecycleCallback
} from '../utils/types';

function makeLifecycle<T extends ComponentClass, K extends keyof LifecycleEvents<T>>(name: K) {
    return (hook: LifecycleEvents<any>[K]) => {
        if (process.env.NODE_ENV !== 'production') {
            if (!currentInstance) {
                throwError(`on${name[1].toUpperCase() + name.substr(2)}() can only be used inside init()`);
            }
        }

        currentInstance!.on(name, hook);
    }
}

export const onInited = makeLifecycle('$inited');
export const onBeforeMount: <T extends ComponentClass>(hook: MountLifecycleCallback<T>) => void = makeLifecycle('$beforeMount');
export const onMounted: <T extends ComponentClass>(hook: MountLifecycleCallback<T>) => void = makeLifecycle('$mounted');
export const onBeforeUpdate: <T extends ComponentClass>(hook: UpdateLifecycleCallback<T>) => void = makeLifecycle('$beforeUpdate');
export const onUpdated: <T extends ComponentClass>(hook: UpdateLifecycleCallback<T>) => void = makeLifecycle('$updated');
export const onBeforeUnmount: <T extends ComponentClass>(hook: UnmountLifecycleCallback<T>) => void = makeLifecycle('$beforeUnmount');
export const onUnmounted: <T extends ComponentClass>(hook: UnmountLifecycleCallback<T>) => void = makeLifecycle('$unmounted');
