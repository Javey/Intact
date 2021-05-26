import {currentInstance} from './component';
import {throwError} from 'intact-shared';

function makeLifecycle(name: string) {
    const eventName = `$${name}`;
    return (hook: Function) => {
        if (process.env.NODE_ENV !== 'production') {
            if (!currentInstance) {
                throwError(`on${name[0].toUpperCase() + name.substr(1)}() can only be used inside init()`);
            }
        }

        currentInstance!.on(eventName, hook);
    }
}

export const onInited = makeLifecycle('inited');
export const onBeforeMount = makeLifecycle('beforeMount');
export const onMounted = makeLifecycle('mounted');
export const onBeforeUpdate = makeLifecycle('beforeUpdate');
export const onUpdated = makeLifecycle('updated');
export const onBeforeUnmount = makeLifecycle('beforeUnmount');
export const onUnmounted = makeLifecycle('unmounted');

