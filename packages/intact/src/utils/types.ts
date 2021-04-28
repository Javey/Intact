import {Children, Props} from 'misstime';

export type ChangeTrace = {path: string, newValue: any, oldValue: any};

export type Template<T = any> = (this: T) => Children;

export type SetOptions = {
    silent: boolean
    // async: false
}
