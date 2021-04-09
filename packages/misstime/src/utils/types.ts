export type VNodeTag = string | ComponentConstructor | ComponentFunction | null

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
    dom: Text | Comment | null,
}
export interface VNodeComponentClass<T extends ComponentClass = ComponentClass> extends VNode<ComponentConstructor<T>> { }
export interface VNodeComponentFunction<T extends ComponentFunction = ComponentFunction> extends VNode<T> { }

export type VNodeProps<T extends VNodeTag> =
    T extends string ? 
        Props<Record<string, any>, Element> :
        T extends null ?
            Props<{}, Element> :
            T extends ComponentConstructor<infer C> ?
                C extends ComponentClass<infer P> ?
                    Props<P, C> :
                    never :
                T extends ComponentFunction<infer P> ?
                    Props<P, Element | ComponentClass<any>> :
                    never

export type VNodeChildren<T extends VNodeTag> =
    T extends ComponentConstructor<infer C> ?
        C: 
        T extends ComponentFunction ?
            VNode :
            T extends null ?
                string | number :
                NormalizedChildren

export type VNodeRef<T extends VNodeTag> =
    T extends ComponentConstructor<infer C> ?
        Ref<C> :
        T extends ComponentFunction<infer P> ?
            Ref<any> :
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
    new (props: T extends ComponentClass<infer P> ? P : {}, mountedQueue: Function[]): T
    displayName?: string
    typeDefs?: TypeDefs<T extends ComponentClass<infer P> ? P : {}>
}

export interface ComponentClass<P = any> {
    props: Props<P, ComponentClass<P>>;

    $SVG: boolean;
    $vNode: VNodeComponentClass<ComponentClass<P>> | null;
    $lastInput: VNode | null;
    $mountedQueue: Function[] | null;
    $parent: ComponentClass | null;

    $render(lastVNode: VNodeComponentClass | null, vNode: VNodeComponentClass, parentDom: Element, anchor: IntactDom | null, mountedQueue: Function[]): void;
    $mount(lastVNode: VNodeComponentClass | null, vNode: VNodeComponentClass): void;
    $update(lastVNode: VNodeComponentClass , vNode: VNodeComponentClass, parentDom: Element, anchor: IntactDom | null, mountedQueue: Function[], force: boolean): void;
    $unmount(vNode: VNodeComponentClass | null, nextVNode: VNodeComponentClass | null): void;
}

export interface ComponentFunction<P = any> {
    (props: Props<P>): Children;
    displayName?: string
    typeDefs?: TypeDefs<P>
}

export type Component = ComponentConstructor | ComponentFunction;

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

export type ChangeTrace = {path: string, newValue: any, oldValue: any};

export type Template = () => Children;

export type SetOptions = {
    silent: boolean
    // async: false
}

export type TypePrimitive = Function | string | number | null | undefined; 
export type TypeObject = {
    type?: TypePrimitive | TypePrimitive[],
    validator?: Function,
    required?: boolean | Function,
}
export type TypeDefs<T> = {[key in keyof Props<T>]?: TypePrimitive | TypePrimitive[] | TypeObject};

