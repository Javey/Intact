export type VNodeTag = string | Component | null

export interface VNode<T extends VNodeTag = VNodeTag> {
    dom: IntactDom | null
    type: Types
    tag: T
    childrenType: ChildrenTypes
    props?: VNodeProps<T> | null
    children?: VNodeChildren<T> | null
    className?: string | null
    key: Key | null
    ref: VNodeRef<T> | null
    isValidated?: boolean,
}
export interface VNodeElement extends VNode<string> { }
export interface VNodeTextElement extends VNode<null> {
    children: string | number,
    dom: Text | Comment | null,
}
export interface VNodeComponentClass<T extends ComponentConstructor = ComponentConstructor> extends VNode<T> { }
export interface VNodeComponentFunction<T extends ComponentFunction = ComponentFunction> extends VNode<T> { }

export type VNodeProps<T extends VNodeTag> =
    T extends string ? 
        Props<any, Element> :
        T extends null ?
            Props<{}, Element> :
            T extends ComponentConstructor<infer P> ?
                Props<P, T> :
                T extends ComponentFunction<infer P> ?
                    Props<P, Element | ComponentClass<any>> :
                    never

export type VNodeChildren<T extends VNodeTag> =
    T extends ComponentConstructor<infer P> ?
        ComponentClass<P> :
        NormalizedChildren

export type VNodeRef<T extends VNodeTag> =
    T extends ComponentConstructor<infer P> ?
        Ref<ComponentClass<P>> :
        T extends ComponentFunction<infer P> ?
            Ref<Element | ComponentClass<any>> :
            Ref<Element>

export type IntactDom = Element | Text | Comment

export const enum Types {
    Text = 1,
    CommonElement = 1 << 1,

    ComponentClass = 1 << 2,
    ComponentFunction = 1 << 3,

    HtmlComment = 1 << 4,

    InputElement = 1 << 5,
    SelectElement = 1 << 6,
    TextareaElement = 1 << 7,
    SvgElement = 1 << 8,

    UnescapeText = 1 << 9,
    Void = 1 << 10,
    Fragment = 1 << 11,
    InUse = 1 << 12,
    Normalized = 1 << 13,
    PrefixedKey = 1 << 14,

    Component = ComponentClass | ComponentFunction,

    FormElement = InputElement | SelectElement | TextareaElement,
    TextElement = Text | HtmlComment | Void,
    Element = CommonElement | FormElement | SvgElement,
    HtmlElement = Element | TextElement,
    InUseOrNormalized = InUse | Normalized,
    ClearInUse = ~InUse,
};

export const enum ChildrenTypes {
    UnknownChildren = 0,
    HasInvalidChildren = 1,
    HasVNodeChildren = 1 << 1,
    HasNonKeyedChildren = 1 << 2,
    HasKeyedChildren = 1 << 3,
    HasTextChildren = 1 << 4,

    MultipleChildren = HasNonKeyedChildren | HasKeyedChildren,
}

export type NormalizedChildren = VNode | VNode[] | null | undefined | string | number;

export type Children = NormalizedChildren | NormalizedChildren[] | boolean | Children[];

export type Key = string | number;

export interface RefObject<T> {
    value: T | null;
    readonly __is_ref: boolean,
}

export type Ref<T = Element> = ((i: T | null) => any) | RefObject<T>;

export type Props<P extends {}, T = Element> = {
    children?: Children
    ref?: Ref<T> 
    key?: Key
    className?: string
} & P;

export interface ComponentConstructor<T extends ComponentClass = ComponentClass> {
    new (props: any): T
    displayName?: string
}

export type VClass<T extends ComponentClass = ComponentClass> = ComponentConstructor<T>

export interface ComponentClass<P = any> {
    // static displayName?: string

    props: Props<P, ComponentClass>;

    $SVG: boolean;
    // $vNode: VNodeComponentClass<P> | null;
    $lastInput: VNode | null;
    $mountedQueue: Function[] | null;

    // constructor(props: P)

    $render(lastVNode: VClass | null, vNode: VClass, parentDom: Element, anchor: IntactDom | null): void;
    $mount(lastVNode: VClass | null, vNode: VClass<this>): void;
    $update(lastVNode: VClass , vNode: VClass<this>, parentDom: Element, anchor: IntactDom | null): void;
    $unmount(vNode: VClass<this> | null, nextVNode: VClass | null): void;

    init?(props: P): any;
    beforeCreate?(lastVNode: VClass | null, nextVNode: VClass<this> | null): void;
    created?(lastVNode: VClass | null, nextVNode: VClass<this> | null): void;
    beforeMount?(lastVNode: VClass | null, nextVNode: VClass<this> | null): void;
    mounted?(lastVNode: VClass | null, nextVNode: VClass<this> | null): void;
    beforeUpdate?(lastVNode: VClass | null, nextVNode: VClass<this> | null): void;
    updated?(lastVNode: VClass | null, nextVNode: VClass<this> | null): void;
    beforeUnmount?(vNode: VClass<this> | null, nextVNode: VClass | null): void;
    unmounted?(vNode: VClass<this> | null, nextVNode: VClass | null): void;
}

export interface ComponentFunction<P = any> {
    (props: Props<P>): Children;
}

export type Component<P = any> = ComponentConstructor<P> | ComponentFunction<P>;

export interface LinkedEvent<T, E extends Event> {
    data: T;
    event: (data: T, event: E) => void;
}

export type MissTimeEventListener = EventListener | LinkedEvent<any, any> | null;

export interface MissTimeElement extends Element {
    [key: string]: any;
    $EV?: Record<string, MissTimeEventListener>;
    $V?: VNode | null;
};

export type Reference = {
    value: boolean
};
