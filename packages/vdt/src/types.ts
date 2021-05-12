import {ComponentClass, Props, Blocks, Children} from 'misstime';

export type Template<T = any> = (this: T, $props: Props<any> | null, $blocks?: Blocks<T>) => Children;

export type Compile = (source: string) => Template

export interface ComponentWithSetterAndGetter extends ComponentClass {
    set(key: string, value: any): void
    get(key: string): any
}
