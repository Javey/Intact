import {VNodeComponentClass} from 'intact';
import {currentInstance} from './component';
import {throwError} from 'intact-shared';

type MountLifecycleCallback = (lastVNode: VNodeComponentClass | null, nextVNode: VNodeComponentClass) => void
type UpdateLifecycleCallback = (lastVNode: VNodeComponentClass, nextVNode: VNodeComponentClass) => void 
type UnmountLifecycleCallback = (lastVNode: VNodeComponentClass, nextVNode: VNodeComponentClass | null) => void 

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
export const onBeforeMount = makeLifecycle<MountLifecycleCallback>('beforeMount');
export const onMounted = makeLifecycle<MountLifecycleCallback>('mounted');
export const onBeforeUpdate = makeLifecycle<UpdateLifecycleCallback>('beforeUpdate');
export const onUpdated = makeLifecycle<UpdateLifecycleCallback>('updated');
export const onBeforeUnmount = makeLifecycle<UnmountLifecycleCallback>('beforeUnmount');
export const onUnmounted = makeLifecycle<UnmountLifecycleCallback>('unmounted');
