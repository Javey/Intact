import {VNodeComponentClass, ComponentClass} from 'misstime';
import {currentInstance} from './component';
import {throwError} from 'intact-shared';

type MountLifecycleCallback<T extends ComponentClass> = (lastVNode: VNodeComponentClass<T> | null, nextVNode: VNodeComponentClass<T>) => void
type UpdateLifecycleCallback<T extends ComponentClass> = (lastVNode: VNodeComponentClass<T>, nextVNode: VNodeComponentClass<T>) => void 
type UnmountLifecycleCallback<T extends ComponentClass> = (lastVNode: VNodeComponentClass<T>, nextVNode: VNodeComponentClass<T> | null) => void 

function makeLifecycle<T extends Function>(name: string) {
    const eventName = `$${name}`;
    return (hook: T) => {
        if (process.env.NODE_ENV !== 'production') {
            if (!currentInstance) {
                throwError(`on${name[0].toUpperCase() + name.substr(1)}() can only be used inside init()`);
            }
        }

        currentInstance!.on(eventName, hook);
    }
}

export const onInited = makeLifecycle<() => void>('inited');
export const onBeforeMount: <T extends ComponentClass>(hook: MountLifecycleCallback<T>) => void = makeLifecycle('beforeMount');
export const onMounted: <T extends ComponentClass>(hook: MountLifecycleCallback<T>) => void = makeLifecycle('mounted');
export const onBeforeUpdate: <T extends ComponentClass>(hook: UpdateLifecycleCallback<T>) => void = makeLifecycle('beforeUpdate');
export const onUpdated: <T extends ComponentClass>(hook: UpdateLifecycleCallback<T>) => void = makeLifecycle('updated');
export const onBeforeUnmount: <T extends ComponentClass>(hook: UnmountLifecycleCallback<T>) => void = makeLifecycle('beforeUnmount');
export const onUnmounted: <T extends ComponentClass>(hook: UnmountLifecycleCallback<T>) => void = makeLifecycle('unmounted');
