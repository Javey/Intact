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
    transition: TransitionHooks | null
    position: TransitionPosition | null
    newPosition: TransitionPosition | null
}
export interface VNodeElement extends VNode<string> { }
export interface VNodeTextElement extends VNode<null> {
    dom: Text | Comment | null,
}
export interface VNodeComponentClass<T extends ComponentClass = ComponentClass> extends VNode<ComponentConstructor<T>> { }
export interface VNodeComponentFunction<T extends ComponentFunction = ComponentFunction> extends VNode<T> { }

export interface TransitionHooks {
    beforeEnter(el: TransitionElement): void
    enter(el: TransitionElement): void
    leave(el: TransitionElement, remove: () => void): void
}

export interface TransitionElement extends HTMLElement {
    _enterCb?: PendingCallback
    _leaveCb?: PendingCallback
    _moveCb?: (e?: TransitionEvent) => void
    $TC?: Record<string, boolean>
    $TD?: string
}

export interface TransitionPosition {
    top: number
    left: number
}

export type PendingCallback = (cancelled?: boolean) => void

export type VNodeProps<T extends VNodeTag> =
    T extends string ? 
        Props<Record<string, any>, Element> :
        T extends null ?
            Props<{}, Element> :
            T extends ComponentConstructor<infer C> ?
                C extends ComponentClass<infer P> ?
                    Props<P, C> :
                    never :
                T extends ComponentFunction<infer P, infer R> ?
                    Props<P, R> :
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
        T extends ComponentFunction<infer P, infer R> ?
            Ref<R> :
            Ref<Element>

export type IntactDom = Element | Text | Comment

export const enum Types {
    Text = 1,
    CommonElement = 1 << 1,

    ComponentUnknown = 1 << 2,
    ComponentClass = 1 << 3,
    ComponentFunction = 1 << 4,

    HtmlComment = 1 << 5,

    InputElement = 1 << 5,
    SelectElement = 1 << 7,
    TextareaElement = 1 << 8,
    SvgElement = 1 << 9,

    UnescapeText = 1 << 10, // for server render to string
    Void = 1 << 11,
    Fragment = 1 << 12,
    InUse = 1 << 13,
    Normalized = 1 << 14,
    PrefixedKey = 1 << 15,

    Component = ComponentClass | ComponentFunction | ComponentUnknown,
    ComponentKnown = ComponentClass | ComponentFunction,
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

export type NormalizedChildren = VNode<any> | VNode<any>[] | null | undefined | string | number;

export type Children = NormalizedChildren | NormalizedChildren[] | boolean | Children[];

export type Key = string | number;

export interface RefObject<T> {
    value: T | null;
    readonly __is_ref: boolean,
}

export type RefFunction<T> = { bivarianceHack(i: T | null): any }["bivarianceHack"];

export type Ref<T> = RefFunction<T> | RefObject<T>;

export type Props<P extends {}, T extends Element | ComponentClass = Element | ComponentClass> = {
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

    $inited: boolean;
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

export interface ComponentFunction<P = any, R extends Element | ComponentClass = Element | ComponentClass> {
    (props: Props<P, R>): Children;
    displayName?: string
    typeDefs?: TypeDefs<P>
}

export type Component = ComponentConstructor | ComponentFunction;

export interface LinkedEvent<T, E extends Event = Event> {
    data: T;
    event: (data: T, event: E) => void;
}

export type IntactEventListener = EventListener | LinkedEvent<any> | null;

export interface IntactElement extends Element {
    [key: string]: any;
    $EV?: Record<string, IntactEventListener>;
    $V?: VNode | null;
    $M?: string | null; // v-model
    $TV?: any; // trueValue
    $FV?: any; // falseValue
};

export type Reference = {
    value: boolean
    result: boolean
};

export type ChangeTrace = {path: string, newValue: any, oldValue: any};

export type Template<T = any> = (this: T) => Children;

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

