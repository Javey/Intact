import {
    VNode,
    Types,
    ChildrenTypes,
    NormalizedChildren,
    VNodeElement,
    VNodeComponentClass,
    VNodeComponentFunction,
    VNodeTextElement,
    IntactDom,
    ComponentClass,
    TransitionElement,
} from '../utils/types';
import {mount, mountArrayChildren, mountComponentClass} from './mount';
import {remove, unmount, clearDom, removeAllChildren} from './unmount';
import {
    replaceChild,
    setTextContent,
    removeChild,
    insertOrAppend,
    REFERENCE,
    findDomFromVNode,
    removeVNodeDom,
    moveVNodeDom,
} from '../utils/common';
import {isNullOrUndefined, isUndefined, EMPTY_OBJ} from 'intact-shared';
import {directClone, normalizeRoot} from './vnode';
import {patchProp} from '../utils/props';
import {processElement} from '../wrappers/process';
import {mountRef, unmountRef} from '../utils/ref';
import {validateKeys, validateProps} from '../utils/validate';

export function patch(
    lastVNode: VNode,
    nextVNode: VNode,
    parentDom: Element,
    parentComponent: ComponentClass | null,
    isSVG: boolean,
    anchor: IntactDom | null,
    mountedQueue: Function[],
    reusing: boolean,
) {
    const nextType = (nextVNode.type |= Types.InUse);

    if (lastVNode.type !== nextType || lastVNode.key !== nextVNode.key) {
        replaceWithNewNode(lastVNode, nextVNode, parentDom, parentComponent, isSVG, anchor, mountedQueue, reusing);
    } else if (nextType & Types.ComponentClass) {
        // if patch two class components, reuse its dom otherwise replace the dom totally.
        patchComponentClass(lastVNode as VNodeComponentClass, nextVNode as VNodeComponentClass, parentDom, parentComponent, isSVG, anchor, mountedQueue, reusing);
    } else if (lastVNode.tag !== nextVNode.tag) {
        replaceWithNewNode(lastVNode, nextVNode, parentDom, parentComponent, isSVG, anchor, mountedQueue, reusing);
    } else if (nextType & Types.Element) {
        patchElement(lastVNode as VNodeElement, nextVNode as VNodeElement, parentComponent, isSVG, nextType, mountedQueue, reusing);
    } else if (nextType & Types.ComponentFunction) {
        patchComponentFunction(lastVNode as VNodeComponentFunction, nextVNode as VNodeComponentFunction, parentDom, parentComponent, isSVG, anchor, mountedQueue, reusing);
    } else if (nextType & Types.Text || nextType & Types.HtmlComment) {
        patchText(lastVNode as VNodeTextElement, nextVNode as VNodeTextElement); 
    } else if (nextType & Types.Fragment) {
        // patchFragment(lastVNode as VNodeElement, nextVNode as VNodeElement, parentDom, isSVG, anchor, mountedQueue);
        patchChildren(
            lastVNode.childrenType,
            nextVNode.childrenType, 
            (lastVNode as VNodeElement).children,
            (nextVNode as VNodeElement).children,
            parentDom,
            parentComponent,
            isSVG,
            anchor,
            lastVNode,
            mountedQueue,
            reusing,
        );
    }
}

function replaceWithNewNode(
    lastVNode: VNode,
    nextVNode: VNode,
    parentDom: Element,
    parentComponent: ComponentClass | null,
    isSVG: boolean,
    anchor: IntactDom | null,
    mountedQueue: Function[],
    reusing: boolean
) {
    if (lastVNode.type & Types.InUse) {
        if (!reusing) {
            unmount(lastVNode);
        }
        if ((nextVNode.type & lastVNode.type & Types.HtmlElement) && isUndefined(lastVNode.transition)) {
            // single dom
            mount(nextVNode, null, parentComponent, isSVG, null, mountedQueue); 
            replaceChild(parentDom, nextVNode.dom as Element, lastVNode.dom as Element);
        } else {
            mount(nextVNode, parentDom, parentComponent, isSVG, findDomFromVNode(lastVNode, true), mountedQueue);
            removeVNodeDom(lastVNode, parentDom); 
        }
    } else {
        // Last vNode is not in use, it has crashed. Just mount next vNode and ignore last one.
        mount(nextVNode, parentDom, parentComponent, isSVG, anchor, mountedQueue);
    }
}

function patchComponentClass(
    lastVNode: VNodeComponentClass,
    nextVNode: VNodeComponentClass, 
    parentDom: Element,
    parentComponent: ComponentClass | null,
    isSVG: boolean,
    anchor: IntactDom | null,
    mountedQueue: Function[],
    reusing: boolean,
) {
    const nextTag = nextVNode.tag;
    if (lastVNode.tag !== nextTag || reusing) {
        if (!reusing) {
            unmount(lastVNode);
        }
        mountComponentClass(lastVNode, nextVNode, parentDom, parentComponent, isSVG, anchor, mountedQueue); 
    } else {
        if (process.env.NODE_ENV !== 'production') {
            validateProps(nextVNode);
        }

        const instance = nextVNode.children = lastVNode.children;

        // If component has crashed, ignore it to stay functional
        /* istanbul ignore next */
        if (isNullOrUndefined(instance)) return;

        instance.$mountedQueue = mountedQueue;
        instance.$vNode = nextVNode;
        instance.$parent = parentComponent;

        instance.$update(lastVNode, nextVNode, parentDom, anchor, mountedQueue, false);

        const lastRef = lastVNode.ref;
        const nextRef = nextVNode.ref;
        if (lastRef !== nextRef) {
            unmountRef(lastRef);
            mountRef(nextRef, instance);
        }
    }
}

function patchComponentFunction(
    lastVNode: VNodeComponentFunction,
    nextVNode: VNodeComponentFunction,
    parentDom: Element,
    parentComponent: ComponentClass | null,
    isSVG: boolean,
    anchor: IntactDom | null,
    mountedQueue: Function[],
    reusing: boolean,
) {
    if (process.env.NODE_ENV !== 'production') {
        validateProps(nextVNode);
    }

    const nextChildren = normalizeRoot(nextVNode.tag(nextVNode.props || EMPTY_OBJ), nextVNode);

    patch(lastVNode.children!, nextChildren, parentDom, parentComponent, isSVG, anchor, mountedQueue, reusing);
    nextVNode.children = nextChildren;
}

export function patchElement(
    lastVNode: VNodeElement,
    nextVNode: VNodeElement,
    parentComponent: ComponentClass | null,
    isSVG: boolean,
    nextType: Types,
    mountedQueue: Function[],
    reusing: boolean,
) {
    const dom = nextVNode.dom = lastVNode.dom as Element;
    const lastProps = lastVNode.props || EMPTY_OBJ;
    const nextProps = nextVNode.props || EMPTY_OBJ;
    
    isSVG = isSVG || (nextType & Types.SvgElement) > 0;

    REFERENCE.value = false;
    let isFormElement = false;
    if (lastProps !== nextProps) {
        if (nextProps !== EMPTY_OBJ) {
            isFormElement = (nextType & Types.FormElement) > 0;
            
            for (const prop in nextProps) {
                const lastValue = lastProps[prop];
                const nextValue = nextProps[prop];
                if (lastValue !== nextValue) {
                    patchProp(prop, lastValue, nextValue, dom, isSVG, isFormElement, REFERENCE, lastVNode);
                }
            }
        }
        if (lastProps !== EMPTY_OBJ) {
            for (const prop in lastProps) {
                if (isNullOrUndefined(nextProps[prop]) && !isNullOrUndefined(lastProps[prop])) {
                    patchProp(prop, lastProps[prop], null, dom, isSVG, isFormElement, REFERENCE, lastVNode);
                }
            }
        }
    }

    // patch className
    const nextClassName = nextVNode.className;
    if (lastVNode.className !== nextClassName) {
        const transitionClassname = (dom as TransitionElement).$TC;
        if (isNullOrUndefined(nextClassName)) {
            if (isUndefined(transitionClassname)) {
                dom.removeAttribute('class');
            } else {
                dom.className = Object.keys(transitionClassname).join(' ');
            }
        } else if (isSVG) {
            dom.setAttribute('class', nextClassName);
        } else if (isUndefined(transitionClassname)) {
            dom.className = nextClassName;
        } else {
            dom.className = nextClassName + ' ' + Object.keys(transitionClassname).join(' ');
        }
    }

    if (process.env.NODE_ENV !== 'production') {
        validateKeys(nextVNode);
    }

    const nextChildren = nextVNode.children;
    // TODO: patchContendEditableChild
    // if (nextType & )
    patchChildren(
        lastVNode.childrenType,
        nextVNode.childrenType,
        lastVNode.children,
        nextChildren,
        dom,
        parentComponent,
        isSVG && nextVNode.tag !== 'foreignObject',
        null,
        lastVNode,
        mountedQueue,
        reusing,
    );

    if (isFormElement) {
        processElement(nextType, nextVNode, dom, nextProps, false, REFERENCE.value);
    }

    const nextRef = nextVNode.ref;
    if (reusing) {
        mountRef(nextRef, dom);
    } else {
        const lastRef = lastVNode.ref;
        if (lastRef !== nextRef) {
            unmountRef(lastRef);
            mountRef(nextRef, dom);
        }
    }
}

function patchText(lastVNode: VNodeTextElement, nextVNode: VNodeTextElement) {
    const nextText = nextVNode.children as string;
    const dom = nextVNode.dom = lastVNode.dom;

    if (nextText !== lastVNode.children) {
        dom!.nodeValue = nextText;
    }
}

// function patchFragment(lastVNode: VNodeElement, nextVNode: VNodeElement, parentDom: Element, isSVG: boolean, anchor: IntactDom | null, mountedQueue: Function[]) {
    // const lastChildren = lastVNode.children as VNode[];
    // let nextChildren = nextVNode.children;
    // const lastChildrenType = lastVNode.childrenType;
    // let nextChildrenType = nextVNode.childrenType;
    // let anchor: Element | null = null;

    // if (nextChildrenType & ChildrenTypes.MultipleChildren && (nextChildren as VNode[]).length === 0) {
        // nextChildrenType = nextVNode.childrenType = ChildrenTypes.HasVNodeChildren;
        // nextChildren = nextVNode.children = createVoidVNode();
    // }

    // const nextIsSingle = (nextChildrenType & ChildrenTypes.HasVNodeChildren) !== 0;

    // if (lastChildrenType & ChildrenTypes.MultipleChildren) {
        // const lastLen = lastChildren.length;

        // // We need to known Fragment's edge node when
        // if (
            // // It uses keyed algorithm
            // (lastChildrenType & nextChildrenType & ChildrenTypes.HasKeyedChildren) ||
            // // It transforms from may to signle
            // nextIsSingle ||
            // // It will append more nodes
            // (nextChildren as VNode[]).length > lastLen
        // ) {
            // // When Fragment has mutliple children there is always at least one vNode
            // anchor = (findDomFromVNode(lastChildren[lastLen - 1], false) as Element).nextSibling as Element;
        // }
    // }

    // patchChildren(lastChildrenType, nextChildrenType, lastChildren, nextChildren, parentDom, isSVG, anchor, lastVNode, mountedQueue);
    // patchChildren(lastVNode.childrenType, nextVNode.childrenType, lastVNode.children, nextVNode.children, parentDom, isSVG, anchor, lastVNode, mountedQueue);
// }

export function patchChildren(
    lastChildrenType: ChildrenTypes,
    nextChildrenType: ChildrenTypes,
    lastChildren: NormalizedChildren,
    nextChildren: NormalizedChildren,
    parentDom: Element,
    parentComponent: ComponentClass | null,
    isSVG: boolean,
    anchor: IntactDom | null,
    parentVNode: VNode,
    mountedQueue: Function[],
    reusing: boolean,
) {
    switch (lastChildrenType) {
        case ChildrenTypes.HasVNodeChildren:
            switch (nextChildrenType) {
                case ChildrenTypes.HasVNodeChildren:
                    patch(lastChildren as VNode, nextChildren as VNode, parentDom, parentComponent, isSVG, anchor, mountedQueue, reusing);
                    break;
                case ChildrenTypes.HasInvalidChildren:
                    remove(lastChildren as VNode, parentDom, reusing);
                    break;
                case ChildrenTypes.HasTextChildren:
                    unmount(lastChildren as VNode);
                    setTextContent(parentDom, nextChildren as string);
                    break;
                default:
                    replaceOneVNodeWithMulipleVNodes(lastChildren as VNode, nextChildren as VNode[], parentDom, parentComponent, isSVG, mountedQueue, reusing);
                    break;
            }
            break;
        case ChildrenTypes.HasInvalidChildren:
            switch (nextChildrenType) {
                case ChildrenTypes.HasVNodeChildren:
                    mount(nextChildren as VNode, parentDom, parentComponent, isSVG, anchor, mountedQueue);
                    break;
                case ChildrenTypes.HasInvalidChildren:
                    break;
                case ChildrenTypes.HasTextChildren:
                    setTextContent(parentDom, nextChildren as string);
                    break;
                default:
                    mountArrayChildren(nextChildren as VNode[], parentDom, parentComponent, isSVG, anchor, mountedQueue);
                    break;
            }
            break;
        case ChildrenTypes.HasTextChildren:
            switch (nextChildrenType) {
                case ChildrenTypes.HasVNodeChildren:
                    clearDom(parentDom);
                    mount(nextChildren as VNode, parentDom, parentComponent, isSVG, anchor, mountedQueue);
                    break;
                case ChildrenTypes.HasInvalidChildren:
                    clearDom(parentDom);
                    break;
                case ChildrenTypes.HasTextChildren:
                    patchSingleTextChild(lastChildren as string, nextChildren as string, parentDom);
                    break;
                default:
                    clearDom(parentDom);
                    mountArrayChildren(nextChildren as VNode[], parentDom, parentComponent, isSVG, anchor, mountedQueue);
                    break;
            }
            break;
        default:
            switch (nextChildrenType) {
                case ChildrenTypes.HasVNodeChildren:
                    removeAllChildren(lastChildren as VNode[], parentDom, parentVNode, reusing);
                    mount(nextChildren as VNode, parentDom, parentComponent, isSVG, anchor, mountedQueue);
                    break;
                case ChildrenTypes.HasInvalidChildren:
                    removeAllChildren(lastChildren as VNode[], parentDom, parentVNode, reusing);
                    break;
                case ChildrenTypes.HasTextChildren:
                    removeAllChildren(lastChildren as VNode[], parentDom, parentVNode, reusing);
                    setTextContent(parentDom, nextChildren as string);
                    break;
                default:
                    const lastLength = (lastChildren as VNode[]).length;
                    const nextLength = (nextChildren as VNode[]).length;

                    if (lastLength === 0) {
                        if (nextLength > 0) {
                            mountArrayChildren(nextChildren as VNode[], parentDom, parentComponent, isSVG, anchor, mountedQueue);
                        }
                    } else if (nextLength === 0) {
                        removeAllChildren(lastChildren as VNode[], parentDom, parentVNode, reusing);
                    } else if (
                        nextChildrenType === ChildrenTypes.HasKeyedChildren &&
                        lastChildrenType === ChildrenTypes.HasKeyedChildren
                    ) {
                        patchKeyedChildren(
                            lastChildren as VNode[],
                            nextChildren as VNode[],
                            parentDom,
                            parentComponent,
                            isSVG,
                            lastLength,
                            nextLength,
                            anchor,
                            parentVNode,
                            mountedQueue,
                            reusing,
                        );
                    } else {
                        patchNonKeyedChildren(
                            lastChildren as VNode[],
                            nextChildren as VNode[],
                            parentDom,
                            parentComponent,
                            isSVG,
                            lastLength,
                            nextLength,
                            anchor,
                            mountedQueue,
                            reusing,
                        );
                    }
                    break;
            }
            break;
    }
}

function replaceOneVNodeWithMulipleVNodes(
    lastVNode: VNode, 
    nextVNodes: VNode[],
    parentDom: Element,
    parentComponent: ComponentClass | null,
    isSVG: boolean,
    mountedQueue: Function[],
    reusing: boolean,
) {
    if (!reusing) {
        unmount(lastVNode);
    }
    mountArrayChildren(nextVNodes, parentDom, parentComponent, isSVG, findDomFromVNode(lastVNode, true),  mountedQueue);
    removeVNodeDom(lastVNode, parentDom);
}

function patchSingleTextChild(lastChildren: string, nextChildren: string, parentDom: Element) {
    if (lastChildren !== nextChildren) {
        if (lastChildren !== '') {
            (parentDom.firstChild as Node).nodeValue = nextChildren;
        } else {
            setTextContent(parentDom, nextChildren);
        }
    }
}

function patchNonKeyedChildren(
    lastChildren: VNode[],
    nextChildren: VNode[],
    parentDom: Element,
    parentComponent: ComponentClass | null,
    isSVG: boolean,
    lastChildrenLength: number,
    nextChildrenLength: number,
    anchor: IntactDom | null,
    mountedQueue: Function[],
    reusing: boolean,
) {
    const commonLength = lastChildrenLength > nextChildrenLength ? nextChildrenLength : lastChildrenLength;
    let i = 0;
    let nextChild;
    let lastChild;

    for (; i < commonLength; ++i) {
        nextChild = nextChildren[i];
        lastChild = lastChildren[i];

        if (nextChild.type & Types.InUse) {
            nextChild = nextChildren[i] = directClone(nextChild);
        }

        patch(lastChild, nextChild, parentDom, parentComponent, isSVG, anchor, mountedQueue, reusing);
        // FIXME: why should update last children?
        // lastChildren[i] = nextChild;
    }

    if (lastChildrenLength < nextChildrenLength) {
        for (i = commonLength; i < nextChildrenLength; ++i) {
            nextChild = nextChildren[i];

            if (nextChild.type & Types.InUse) {
                nextChild = nextChildren[i] = directClone(nextChild);
            }
            mount(nextChild, parentDom, parentComponent, isSVG, anchor, mountedQueue);
        }
    } else if (lastChildrenLength > nextChildrenLength) {
        for (i = commonLength; i < lastChildrenLength; ++i) {
            remove(lastChildren[i], parentDom, reusing);
        }
    }
}

// https://github.com/localvoid/ivi/blob/e23c8572c9ef434c9ac1433e70eff17a88cb8362/packages/ivi/src/vdom/reconciler.ts#L585
// https://yanni4night.github.io/js/2018/02/11/inferno-dom-diff.html
function patchKeyedChildren(
    a: VNode[],
    b: VNode[],
    parentDom: Element,
    parentComponent: ComponentClass | null,
    isSVG: boolean,
    aLength: number,
    bLength: number,
    anchor: IntactDom | null,
    parentVNode: VNode,
    mountedQueue: Function[],
    reusing: boolean,
) {
    let aEnd = aLength - 1;
    let bEnd = bLength - 1;
    let j = 0;
    let aNode = a[j];
    let bNode = b[j];
    let nextPos: number;
    let nextNode: IntactDom | null;

    // Step 1
    outer: {
        // Sync nodes with the same key at the beginning.
        while (aNode.key === bNode.key) {
            if (bNode.type & Types.InUse) {
                b[j] = bNode = directClone(bNode);
            }
            patch(aNode, bNode, parentDom, parentComponent, isSVG, anchor, mountedQueue, reusing);
            // a[j] = bNode;
            ++j;
            if (j > aEnd || j > bEnd) {
                break outer;
            }
            aNode = a[j];
            bNode = b[j];
        }

        aNode = a[aEnd];
        bNode = b[bEnd];

        // Sync nodes with the same key at the end.
        while (aNode.key === bNode.key) {
            if (bNode.type & Types.InUse) {
                b[bEnd] = bNode = directClone(bNode);
            }
            patch(aNode, bNode, parentDom, parentComponent, isSVG, anchor, mountedQueue, reusing);
            // a[aEnd] = bNode;
            --aEnd;
            --bEnd;
            if (j > aEnd || j > bEnd) {
                break outer;
            }
            aNode = a[aEnd];
            bNode = b[bEnd];
        }
    }

    if (j > aEnd) {
        if (j <= bEnd) {
            nextPos = bEnd + 1;
            nextNode = nextPos < bLength ? findDomFromVNode(b[nextPos], true) : null;
            while (j <= bEnd) {
                bNode = b[j];
                if (bNode.type & Types.InUse) {
                    b[j] = bNode = directClone(bNode);
                }
                ++j;
                mount(bNode, parentDom, parentComponent, isSVG, nextNode, mountedQueue);
            }
        }
    } else if (j > bEnd) {
        while (j <= aEnd) {
            remove(a[j++], parentDom, reusing);
        }
    } else {
        patchKeyedChildrenComplex(a, b, aLength, bLength, aEnd, bEnd, j, parentDom, parentComponent, isSVG, anchor, parentVNode, mountedQueue, reusing);
    }
}

function patchKeyedChildrenComplex(
    a: VNode[],
    b: VNode[],
    aLength: number,
    bLength: number,
    aEnd: number,
    bEnd: number,
    j: number,
    parentDom: Element,
    parentComponent: ComponentClass | null,
    isSVG: boolean,
    anchor: IntactDom | null,
    parentVNode: VNode,
    mountedQueue: Function[],
    reusing: boolean,
) {
    let aNode: VNode;
    let bNode: VNode;
    let nextPos: number;
    let i = 0;
    let aStart = j;
    const bStart = j;
    const aLeft = aEnd - j + 1;
    const bLeft = bEnd - j + 1;
    const sources = new Int32Array(bLeft + 1);
    // Keep track if it's possible to remove whole DOM using textContent = '';
    let canRemoveWholeContent = aLeft === aLength;
    let moved = false;
    let pos = 0;
    let patched = 0;

    // When sizes are small, just loop them through
    if (bLength < 4 || (aLeft | bLeft) < 32) {
        for (i = aStart; i <= aEnd; ++i) {
            aNode = a[i];
            if (patched < bLeft) {
                for (j = bStart; j <= bEnd; ++j) {
                    bNode = b[j];
                    if (aNode.key === bNode.key) {
                        sources[j - bStart] = i + 1;
                        if (canRemoveWholeContent) {
                            canRemoveWholeContent = false;
                            // remove nodes before the key
                            while (aStart < i) {
                                remove(a[aStart++], parentDom, reusing);
                            }
                        }
                        if (pos > j) {
                            moved = true;
                        } else {
                            pos = j;
                        }
                        if (bNode.type & Types.InUse) {
                            b[j] = bNode = directClone(bNode);
                        }
                        patch(aNode, bNode, parentDom, parentComponent, isSVG, anchor, mountedQueue, reusing);
                        ++patched;
                        break;
                    }
                } 
                // remove node if it does not find
                if (!canRemoveWholeContent && j > bEnd) {
                    remove(aNode, parentDom, reusing);
                }
            } else if (!canRemoveWholeContent) {
                // remove node that exceeds the length
                remove(aNode, parentDom, reusing);
            }
        }
    } else {
        const keyIndex: Record<string, number> = {};

        // Map keys by their index
        for (i = bStart; i <= bEnd; ++i) {
            keyIndex[b[i].key!] = i;
        }

        // Try to patch same keys
        for (i = aStart; i <= aEnd; ++i) {
            aNode = a[i];

            if (patched < bLeft) {
                j = keyIndex[aNode.key!];

                if (j !== undefined) {
                    if (canRemoveWholeContent) {
                        canRemoveWholeContent = false;
                        while (aStart < i) {
                            remove(a[aStart++], parentDom, reusing);
                        }
                    }
                    sources[j - bStart] = i + 1;
                    if (pos > j) {
                        moved = true;
                    } else {
                        pos = j;
                    }
                    bNode = b[j];
                    if (bNode.type & Types.InUse) {
                        b[j] = bNode = directClone(bNode);
                    }
                    patch(aNode, bNode, parentDom, parentComponent, isSVG, anchor, mountedQueue, reusing);
                    ++patched;
                } else if (!canRemoveWholeContent) {
                    remove(aNode, parentDom, reusing);
                }
            } else if (!canRemoveWholeContent) {
                remove(aNode, parentDom, reusing);
            }
        }
    }
    // fast-path: if nothing patched remove all old and add all new
    if (canRemoveWholeContent) {
        removeAllChildren(a, parentDom, parentVNode, reusing);
        mountArrayChildren(b, parentDom, parentComponent, isSVG, anchor, mountedQueue);
    } else if (moved) {
        const seq = lisAlgorithm(sources);
        j = seq.length - 1;
        for (i = bLeft - 1; i >=0; i--) {
            if (sources[i] === 0) {
                pos = i + bStart;
                bNode = b[pos];
                if (bNode.type & Types.InUse) {
                    b[pos] = bNode = directClone(bNode);
                }
                nextPos = pos + 1;
                mount(bNode, parentDom, parentComponent, isSVG, nextPos < bLength ? findDomFromVNode(b[nextPos], true) : null, mountedQueue);
            } else if (j < 0 || i !== seq[j]) {
                pos = i + bStart;
                bNode = b[pos];
                nextPos = pos + 1;
                moveVNodeDom(bNode, parentDom, nextPos < bLength ? findDomFromVNode(b[nextPos], true) : anchor);
            } else {
                --j;
            }
        }
    } else if (patched !== bLeft) {
        // when patched count doesn't match b length we need to insert those new ones
        // loop backwards so we can use insertBefore
        for (i = bLeft - 1; i >= 0; --i) {
            if (sources[i] === 0) {
                pos = i + bStart;
                bNode = b[pos];
                if (bNode.type & Types.InUse) {
                    b[pos] = bNode = directClone(bNode);
                }
                nextPos = pos + 1;
                mount(bNode, parentDom, parentComponent, isSVG, nextPos < bLength ? findDomFromVNode(b[nextPos], true) : anchor, mountedQueue);
            }
        }
    }
}

let result: Int32Array;
let p: Int32Array;
let maxLen = 0;
// https://en.wikipedia.org/wiki/Longest_increasing_subsequence
function lisAlgorithm(arr: Int32Array): Int32Array {
    let arrI = 0;
    let i = 0;
    let j = 0;
    let k = 0;
    let u = 0;
    let v = 0;
    let c = 0;
    const len = arr.length;

    if (len > maxLen) {
        maxLen = len;
        result = new Int32Array(len);
        p = new Int32Array(len);
    }

    for (; i < len; ++i) {
        arrI = arr[i];

        if (arrI !== 0) {
            j = result[k];
            if (arr[j] < arrI) {
                p[i] = j;
                result[++k] = i;
                continue;
            }

            u = 0;
            v = k;

            while (u < v) {
                c = (u + v) >> 1;
                if (arr[result[c]] < arrI) {
                    u = c + 1;
                } else {
                    v = c;
                }
            }

            if (arrI < arr[result[u]]) {
                if (u > 0) {
                    p[i] = result[u - 1];
                }
                result[u] = i;
            }
        }
    }

    u = k + 1;
    v = result[u - 1];

    const seq = new Int32Array(u);
    while (u-- > 0) {
        seq[u] = v;
        v = p[v];
        result[u] = 0;
    }

    return seq;
}
