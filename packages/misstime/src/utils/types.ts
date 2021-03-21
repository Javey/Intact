export interface VNode<P = any> {
    dom: Element | Text | null
    type: Types
    tag: string | Component | null
    childrenType: ChildrenTypes
    props?: Props<P, Component> | Props<P, Element> | null
    children?: NormalizedChildren | ComponentClass<P>
    className?: string | null
    key: Key | null
    ref: Ref<Component> | Ref<Element> | null
}
export interface VNodeElement<P = any> extends VNode<P> {
    children?: NormalizedChildren,
    tag: string,
    props?: Props<P, Element> | null,
    ref: Ref<Element>,
}
export interface VNodeTextElement<P = null> extends VNode<P> {
    tag: null,
    props?: null,
    ref: Ref<Element>,
}
export interface VNodeComponent<P = any> extends VNode<P> {
    children?: ComponentClass<P>,
    tag: ComponentConstructor<P>,
    props?: Props<P, Component> | null,
    ref: Ref<Component>,
}

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
    Fragment = 1 << 10,
    InUse = 1 << 11,
    Normalized = 1 << 12,
    PrefixedKey = 1 << 13,

    Component = ComponentClass | ComponentFunction,

    FormElement = InputElement | SelectElement | TextareaElement,
    TextElement = Text | HtmlComment,
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

export type Props<P extends Record<string, any> = {}, T = Element> = {
    children?: Children
    ref?: Ref<T> 
    key?: Key
    className?: string
} & P;

export interface ComponentConstructor<P = any> {
    new (props: P): ComponentClass<P>
}

export interface ComponentClass<P = any> {
    props: Props<P>;

    $SVG: boolean;
    $vNode: VNodeComponent<P> | null;
    $mountedQueue: Function[] | null;

    $render(lastVNode: VNodeComponent | null, vNode: VNodeComponent<P> | null, parentDom: Element): void;
    $update(lastVNode: VNodeComponent | null, vNode: VNodeComponent<P> | null, parentDom: Element): void;
    $destroy(vNode: VNodeComponent<P> | null, nextVNode: VNodeComponent | null, parentDom: Element): void;

    init?(props: P): any;
    beforeCreate?(lastVNode: VNodeComponent | null, nextVNode: VNodeComponent<P> | null): void;
    created?(lastVNode: VNodeComponent | null, nextVNode: VNodeComponent<P> | null): void;
    beforeMount?(lastVNode: VNodeComponent | null, nextVNode: VNodeComponent<P> | null): void;
    mounted?(lastVNode: VNodeComponent | null, nextVNode: VNodeComponent<P> | null): void;
    beforeUpdate?(lastVNode: VNodeComponent | null, nextVNode: VNodeComponent<P> | null): void;
    updated?(lastVNode: VNodeComponent | null, nextVNode: VNodeComponent<P> | null): void;
    beforeDestroy?(vNode: VNodeComponent<P> | null, nextVNode: VNodeComponent | null): void;
    destroyed?(vNode: VNodeComponent<P> | null, nextVNode: VNodeComponent | null): void;
}

export interface ComponentFunction<P = any> {
    (props: Props<P>): Children;
}

export type Component = ComponentConstructor<any> | ComponentFunction;

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
