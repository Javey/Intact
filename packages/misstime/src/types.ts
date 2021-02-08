export interface VNode<P = any> {
    dom: Element | null
    type: Types
    tag: string | Component | null
    childrenType: ChildrenTypes
    props?: Props<P, Component> | Props<P, Element> | null
    children?: NormalizedChildren
    className?: string | null
    key?: Key | null
    ref?: Ref<Component> | Ref<Element> | null
}
export interface VNodeElement<P = any> extends VNode<P> {
    tag: string,
    props?: Props<P, Element> | null,
    ref?: Ref<Element>,
}
export interface VNodeTextElement<P = null> extends VNode<P> {
    tag: null,
    props?: null,
    ref?: Ref<Element>,
}
export interface VNodeComponent<P = any> extends VNode<P> {
    tag: Component,
    props?: Props<P, Component> | null,
    ref?: Ref<Component>,
}
// export type VNode<P = any> = VNodeElement<P> | VNodeComponent<P>;
// export interface VNode<P = any> extends VNodeElement<P>, VNodeComponent<P> {
    // tag: string | Component,
    // props?: Props<P, ComponentOrElement> | null,
    // ref?: Ref<Element> | Ref<Component>
// }
// export interface VNodeConstructor<P = any> {
    // new (
        // type: Types,
        // tag: string,
        // props?: Props<P> | null,
        // children?: NormalizedChildren,
        // className?: string | null,
        // key?: Key,
        // ref?: Ref<Element>,
    // ): VNode<P>
    // new (
        // type: Types,
        // tag: Component,
        // props?: Props<P> | null,
        // children?: NormalizedChildren,
        // className?: string | null,
        // key?: Key,
        // ref?: Ref<Component>,
    // ): VNode<P>
// }

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

export type ComponentOrElement = Component | Element;

export type Ref<T = ComponentOrElement> = (i: T | null) => any;

export type Props<P, T = ComponentOrElement> = {
    children?: Children
    ref?: Ref<T> 
    key?: Key
    className?: string
} & P;

export interface ComponentClass {
    $init(): Element;
    $update(): Element;
}

export interface ComponentFunction {
    (props: any): Children;
}

export type Component = ComponentClass | ComponentFunction;
