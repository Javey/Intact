import {Types, createTextVNode, EMPTY_OBJ, directClone} from './vnode';
import {patchProps} from './vpatch';
import {handleEvent} from './event';
import {
    MountedQueue, isArray, isStringOrNumber,
    isNullOrUndefined, isEventProp, doc as document,
    setTextContent, svgNS, hooks
} from './utils';
import {processForm} from './wrappers/process';

export function render(vNode, parentDom, mountedQueue, parentVNode, isSVG) {
    if (isNullOrUndefined(vNode)) return;
    let isTrigger = true;
    if (mountedQueue) {
        isTrigger = false;
    } else {
        mountedQueue = new MountedQueue();
    }
    const dom = createElement(vNode, parentDom, mountedQueue, true /* isRender */, parentVNode, isSVG);
    if (isTrigger) {
        mountedQueue.trigger();
    }
    return dom;
}

export function createElement(vNode, parentDom, mountedQueue, isRender, parentVNode, isSVG) {
    const type = vNode.type;
    if (type & Types.Element) {
        return createHtmlElement(vNode, parentDom, mountedQueue, isRender, parentVNode, isSVG);
    } else if (type & Types.Text) {
        return createTextElement(vNode, parentDom);
    } else if (type & Types.ComponentClassOrInstance) {
        return createComponentClassOrInstance(vNode, parentDom, mountedQueue, null, isRender, parentVNode, isSVG);
    // } else if (type & Types.ComponentFunction) {
        // return createComponentFunction(vNode, parentDom, mountedQueue, isNotAppendChild, isRender);
    // } else if (type & Types.ComponentInstance) {
        // return createComponentInstance(vNode, parentDom, mountedQueue);
    } else if (type & Types.HtmlComment) {
        return createCommentElement(vNode, parentDom);
    } else {
        throw new Error(`expect a vNode but got ${vNode}`);
    }
}

export function createHtmlElement(vNode, parentDom, mountedQueue, isRender, parentVNode, isSVG) {
    const type = vNode.type;

    isSVG = isSVG || (type & Types.SvgElement) > 0;

    const dom = documentCreateElement(vNode.tag, isSVG);
    const children = vNode.children;
    const props = vNode.props;
    const className = vNode.className;

    vNode.dom = dom;
    vNode.parentVNode = parentVNode;

    if (!isNullOrUndefined(children)) {
        createElements(children, dom, mountedQueue, isRender, vNode,
            isSVG === true && vNode.tag !== 'foreignObject'
        );
    }

    if (!isNullOrUndefined(className)) {
        if (isSVG) {
            dom.setAttribute('class', className);
        } else {
            dom.className = className;
        }
    }

    if (hooks.beforeInsert) {
        hooks.beforeInsert(vNode);
    }

    // in IE8, the select value will be set to the first option's value forcely
    // when it is appended to parent dom. We change its value in processForm does not
    // work. So processForm after it has be appended to parent dom.
    if (parentDom) {
        parentDom.appendChild(dom);
    }
    if (props !== EMPTY_OBJ) {
        patchProps(null, vNode, isSVG, true);
    }

    const ref = vNode.ref;
    if (!isNullOrUndefined(ref)) {
        createRef(dom, ref, mountedQueue);
    }

    return dom;
}

export function createTextElement(vNode, parentDom) {
    const dom = document.createTextNode(vNode.children);
    vNode.dom = dom;

    if (parentDom) {
        parentDom.appendChild(dom);
    }

    return dom;
}

export function createOrHydrateComponentClassOrInstance(vNode, parentDom, mountedQueue, lastVNode, isRender, parentVNode, isSVG, createDom) {
    const props = vNode.props;
    const instance = vNode.type & Types.ComponentClass ?
        new vNode.tag(props) : vNode.children;
    instance.parentDom = parentDom;
    instance.mountedQueue = mountedQueue;
    instance.isRender = isRender;
    instance.parentVNode = parentVNode;
    instance.isSVG = isSVG;
    instance.vNode = vNode;
    vNode.children = instance;
    vNode.parentVNode = parentVNode;

    const dom = createDom(instance);
    const ref = vNode.ref;

    vNode.dom = dom;

    if (typeof instance.mount === 'function') {
        mountedQueue.push(() => instance.mount(lastVNode, vNode));
    }

    if (typeof ref === 'function') {
        ref(instance);
    }

    return dom;
}

export function createComponentClassOrInstance(vNode, parentDom, mountedQueue, lastVNode, isRender, parentVNode, isSVG) {
    return createOrHydrateComponentClassOrInstance(vNode, parentDom, mountedQueue, lastVNode, isRender, parentVNode, isSVG, (instance) => {
        const dom = instance.init(lastVNode, vNode);
        if (parentDom) {
            // for Animate component reuse dom in Intact
            if (!lastVNode && parentDom._reserve) {
                lastVNode = parentDom._reserve[vNode.key];
            }
            if (
                !lastVNode || 
                // maybe we have reused the component and replaced the dom
                lastVNode.dom !== dom && !dom.parentNode || !dom.parentNode.tagName
            ) {
                parentDom.appendChild(dom);
            }
        }

        return dom;
    });
}

// export function createComponentFunction(vNode, parentDom, mountedQueue) {
    // const props = vNode.props;
    // const ref = vNode.ref;

    // createComponentFunctionVNode(vNode);

    // let children = vNode.children;
    // let dom;
    // // support ComponentFunction return an array for macro usage
    // if (isArray(children)) {
        // dom = [];
        // for (let i = 0; i < children.length; i++) {
            // dom.push(createElement(children[i], parentDom, mountedQueue));
        // }
    // } else {
        // dom = createElement(vNode.children, parentDom, mountedQueue);
    // }
    // vNode.dom = dom;

    // // if (parentDom) {
        // // parentDom.appendChild(dom);
    // // }

    // if (ref) {
        // createRef(dom, ref, mountedQueue);
    // }

    // return dom;
// }

export function createCommentElement(vNode, parentDom) {
    const dom = document.createComment(vNode.children);
    vNode.dom = dom;

    if (parentDom) {
        parentDom.appendChild(dom);
    }

    return dom;
}

// export function createComponentFunctionVNode(vNode) {
    // let result = vNode.tag(vNode.props);
    // if (isStringOrNumber(result)) {
        // result = createTextVNode(result);
    // } else if (process.env.NODE_ENV !== 'production') {
        // if (isArray(result)) {
            // throw new Error(`ComponentFunction ${vNode.tag.name} returned a invalid vNode`);
        // }
    // }

    // vNode.children = result;

    // return vNode;
// }

export function createElements(vNodes, parentDom, mountedQueue, isRender, parentVNode, isSVG) {
    if (isStringOrNumber(vNodes)) {
        setTextContent(parentDom, vNodes);
    } else if (isArray(vNodes)) {
        let cloned = false;
        for (let i = 0; i < vNodes.length; i++) {
            let child = vNodes[i];
            if (child.dom) {
                if (!cloned) {
                    parentVNode.children = vNodes = vNodes.slice(0);
                    cloned = true;
                }
                vNodes[i] = child = directClone(child);
            }
            createElement(child, parentDom, mountedQueue, isRender, parentVNode, isSVG);
        }
    } else {
        if (vNodes.dom) {
            parentVNode.children = vNodes = directClone(vNodes);
        }
        createElement(vNodes, parentDom, mountedQueue, isRender, parentVNode, isSVG);
    }
}

export function removeElements(vNodes, parentDom) {
    if (isNullOrUndefined(vNodes)) {
        return;
    } else if (isArray(vNodes)) {
        for (let i = 0; i < vNodes.length; i++) {
            removeElement(vNodes[i], parentDom);
        }
    } else {
        removeElement(vNodes, parentDom);
    }
}

export function removeElement(vNode, parentDom, nextVNode) {
    const type = vNode.type;
    if (type & Types.Element) {
        return removeHtmlElement(vNode, parentDom);
    } else if (type & Types.TextElement) {
        return removeText(vNode, parentDom);
    } else if (type & Types.ComponentClassOrInstance) {
        return removeComponentClassOrInstance(vNode, parentDom, nextVNode);
    } else if (type & Types.ComponentFunction) {
        return removeComponentFunction(vNode, parentDom);
    }
}

export function removeHtmlElement(vNode, parentDom) {
    const ref = vNode.ref;
    const props = vNode.props;
    const dom = vNode.dom;

    if (ref) {
        ref(null);
    }

    removeElements(vNode.children, null);

    // remove event
    for (let name in props) {
        const prop = props[name];
        if (!isNullOrUndefined(prop) && isEventProp(name)) {
            handleEvent(name.substr(3), prop, null, dom);
        }
    }

    if (parentDom) {
        parentDom.removeChild(dom);
    }
}

export function removeText(vNode, parentDom) {
    if (parentDom) {
        parentDom.removeChild(vNode.dom);
    }
}

export function removeComponentFunction(vNode, parentDom) {
    const ref = vNode.ref;
    if (ref) {
        ref(null);
    }
    removeElement(vNode.children, parentDom);
}

export function removeComponentClassOrInstance(vNode, parentDom, nextVNode) {
    const instance = vNode.children;
    const ref = vNode.ref;

    if (typeof instance.destroy === 'function') {
        instance._isRemoveDirectly = !!parentDom;
        instance.destroy(vNode, nextVNode, parentDom);
    }

    if (ref) {
        ref(null);
    }

    // instance destroy method will remove everything
    // removeElements(vNode.props.children, null);

    if (parentDom) {
        removeChild(parentDom, vNode);
    }
}

export function removeAllChildren(dom, vNodes) {
    // setTextContent(dom, '');
    // removeElements(vNodes);
}

export function replaceChild(parentDom, lastVNode, nextVNode) {
    const lastDom = lastVNode.dom;
    const nextDom = nextVNode.dom;
    const parentNode = lastDom.parentNode;
    // maybe the lastDom has be moved
    if (!parentDom || parentNode !== parentDom) parentDom = parentNode;
    if (lastDom._unmount) {
        lastDom._unmount(lastVNode, parentDom);
        if (!nextDom.parentNode) {
            if (parentDom.lastChild === lastDom) {
                parentDom.appendChild(nextDom);
            } else {
                parentDom.insertBefore(nextDom, lastDom.nextSibling);
            }
        }
    } else {
        parentDom.replaceChild(nextDom, lastDom);
    }
}

export function removeChild(parentDom, vNode) {
    const dom = vNode.dom;
    if (dom._unmount) {
        dom._unmount(vNode, parentDom);
    } else {
        parentDom.removeChild(dom);
    }
}

export function createRef(dom, ref, mountedQueue) {
    if (typeof ref === 'function') {
        // mountedQueue.push(() => ref(dom));
        // set ref immediately, because we have unset it before
        ref(dom);
    } else {
        throw new Error(`ref must be a function, but got "${JSON.stringify(ref)}"`);
    }
}

export function documentCreateElement(tag, isSVG) {
    if (isSVG === true) {
        return document.createElementNS(svgNS, tag);
    } else {
        return document.createElement(tag);
    }
}
