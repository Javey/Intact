import {Types, ChildrenTypes, VNode, VNodeTextElement, VNodeElement, VNodeComponentClass, VNodeComponentFunction} from './types';

export function isText(o: VNode): o is VNodeTextElement {
    return (o.type & Types.Text) > 0;
}

export function isElement(o: VNode): o is VNodeElement {
    return (o.type & Types.Element) > 0;
} 

export function isComponentClass(o: VNode): o is VNodeComponentClass {
    return (o.type & Types.ComponentClass) > 0;
}

export function isComponentFunction(o: VNode): o is VNodeComponentFunction {
    return (o.type & Types.ComponentFunction) > 0;
}

export function isFragment(o: VNode): o is VNodeElement {
    return (o.type & Types.Fragment) > 0;
}

export function isComment(o: VNode): o is VNodeTextElement {
    return (o.type & Types.HtmlComment) > 0;
}

export function hasTextChildren(o: VNode) {
    return o.childrenType === ChildrenTypes.HasTextChildren;
}

export function hasInvalidChildren(o: VNode) {
    return o.childrenType === ChildrenTypes.HasInvalidChildren;
}

export function hasVNodeChildren(o: VNode) {
    return o.childrenType === ChildrenTypes.HasVNodeChildren;
}

export function hasMultipleChildren(o: VNode) {
    return (o.childrenType & ChildrenTypes.MultipleChildren) > 0;
}
