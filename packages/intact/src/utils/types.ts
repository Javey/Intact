import {Children, Props, Blocks} from 'misstime';

export type ChangeTrace = {path: string, newValue: any, oldValue: any};

export type Template<T = any> = (this: T, $props: Props<any> | null, $blocks?: Blocks<T>) => Children;

export type SetOptions = {
    silent: boolean
    // async: false
}

export type Compile = (source: string) => Template
