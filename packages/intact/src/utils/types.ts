import {VNodeComponentClass, ComponentClass} from 'misstime';

export type SetOptions = {
    silent: boolean
    // async: false
}

export type UnknownKey<T> = Exclude<string, keyof T>

export type WithUnknownKey<T, U> = Partial<T> & U

export type InjectionKey = string | symbol

export type MountLifecycleCallback<T extends ComponentClass> = (
    lastVNode: VNodeComponentClass<T> | null,
    nextVNode: VNodeComponentClass<T>
) => void;
export type UpdateLifecycleCallback<T extends ComponentClass> = (
    lastVNode: VNodeComponentClass<T>,
    nextVNode: VNodeComponentClass<T>
) => void;
export type UnmountLifecycleCallback<T extends ComponentClass> = (
    lastVNode: VNodeComponentClass<T>,
    nextVNode: VNodeComponentClass<T> | null
) => void;
export type LifecycleEvents<T extends ComponentClass> = {
    $inited: () => void
    $beforeMount: MountLifecycleCallback<T>
    $mounted: MountLifecycleCallback<T>
    $beforeUpdate: UpdateLifecycleCallback<T>
    $updated: UpdateLifecycleCallback<T>
    $beforeUnmount: UnmountLifecycleCallback<T>
    $unmounted: UnmountLifecycleCallback<T>
}
