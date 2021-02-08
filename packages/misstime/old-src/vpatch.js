import {Types, EMPTY_OBJ} from './vnode';
import {
    createElement,
    createElements, 
    removeElements, 
    removeElement,
    removeComponentClassOrInstance,
    removeAllChildren,
    createComponentClassOrInstance,
    // createComponentFunction,
    // createComponentFunctionVNode,
    createRef,
    replaceChild
} from './vdom';
import {isObject, isArray, isNullOrUndefined, 
    isSkipProp, MountedQueue, isEventProp, 
    booleanProps, strictProps,
    browser, setTextContent, isStringOrNumber,
    namespaces, SimpleMap
} from './utils';
import {handleEvent} from './event';
import {processForm} from './wrappers/process';

export function patch(lastVNode, nextVNode, parentDom, mountedQueue, parentVNode, isSVG) {
    let isTrigger = true;
    if (mountedQueue) {
        isTrigger = false;
    } else {
        mountedQueue = new MountedQueue();
    }
    const dom = patchVNode(lastVNode, nextVNode, parentDom, mountedQueue, parentVNode, isSVG);
    if (isTrigger) {
        mountedQueue.trigger();
    }
    return dom;
}

export function patchVNode(lastVNode, nextVNode, parentDom, mountedQueue, parentVNode, isSVG) {
    const nextType = nextVNode.type;
    const lastType = lastVNode.type;

    if (nextType & Types.Element) {
        if (lastType & Types.Element) {
            patchElement(lastVNode, nextVNode, parentDom, mountedQueue, parentVNode, isSVG);
        } else {
            replaceElement(lastVNode, nextVNode, parentDom, mountedQueue, parentVNode, isSVG);
        }
    } else if (nextType & Types.TextElement) {
        if (lastType === nextType) {
            patchText(lastVNode, nextVNode);
        } else {
            replaceElement(lastVNode, nextVNode, parentDom, mountedQueue, isSVG);
        }
    } else if (nextType & Types.ComponentClass) {
        if (lastType & Types.ComponentClass) {
            patchComponentClass(lastVNode, nextVNode, parentDom, mountedQueue, parentVNode, isSVG);
        } else {
            replaceElement(lastVNode, nextVNode, parentDom, mountedQueue, parentVNode, isSVG);
        }
    // } else if (nextType & Types.ComponentFunction) {
        // if (lastType & Types.ComponentFunction) {
            // patchComponentFunction(lastVNode, nextVNode, parentDom, mountedQueue);
        // } else {
            // replaceElement(lastVNode, nextVNode, parentDom, mountedQueue);
        // }
    } else if (nextType & Types.ComponentInstance) {
        if (lastType & Types.ComponentInstance) {
            patchComponentInstance(lastVNode, nextVNode, parentDom, mountedQueue, parentVNode, isSVG);
        } else {
            replaceElement(lastVNode, nextVNode, parentDom, mountedQueue, parentVNode, isSVG);
        }
    }

    return nextVNode.dom;
}

function patchElement(lastVNode, nextVNode, parentDom, mountedQueue, parentVNode, isSVG) {
    const dom = lastVNode.dom;
    const lastProps = lastVNode.props;
    const nextProps = nextVNode.props;
    const lastChildren = lastVNode.children;
    const nextChildren = nextVNode.children;
    const lastClassName = lastVNode.className;
    const nextClassName = nextVNode.className;
    const nextType = nextVNode.type;

    nextVNode.dom = dom;
    nextVNode.parentVNode = parentVNode;

    isSVG = isSVG || (nextType & Types.SvgElement) > 0

    if (lastVNode.tag !== nextVNode.tag || lastVNode.key !== nextVNode.key) {
        replaceElement(lastVNode, nextVNode, parentDom, mountedQueue, parentVNode, isSVG);
    } else {
        if (lastChildren !== nextChildren) {
            patchChildren(lastChildren, nextChildren, dom, mountedQueue, nextVNode, 
                isSVG === true && nextVNode.tag !== 'foreignObject'
            );
        }

        if (lastProps !== nextProps) {
            patchProps(lastVNode, nextVNode, isSVG, false);
        }

        if (lastClassName !== nextClassName) {
            if (isNullOrUndefined(nextClassName)) {
                dom.removeAttribute('class');
            } else {
                if (isSVG) {
                    dom.setAttribute('class', nextClassName);
                } else {
                    dom.className = nextClassName;
                }
            }
        }

        const lastRef = lastVNode.ref;
        const nextRef = nextVNode.ref;
        if (lastRef !== nextRef) {
            if (!isNullOrUndefined(lastRef)) {
                lastRef(null);
            }
            if (!isNullOrUndefined(nextRef)) {
                createRef(dom, nextRef, mountedQueue);
            }
        }
    }
}

function patchComponentClass(lastVNode, nextVNode, parentDom, mountedQueue, parentVNode, isSVG) {
    const lastTag = lastVNode.tag;
    const nextTag = nextVNode.tag;
    const dom = lastVNode.dom;

    let instance;
    let newDom;

    if (lastTag !== nextTag || lastVNode.key !== nextVNode.key) {
        // we should call this remove function in component's init method
        // because it should be destroyed until async component has rendered
        // removeComponentClassOrInstance(lastVNode, null, nextVNode);
        newDom = createComponentClassOrInstance(nextVNode, parentDom, mountedQueue, lastVNode, false, parentVNode, isSVG);
    } else {
        instance = lastVNode.children;
        instance.mountedQueue = mountedQueue;
        if (instance.mounted) {
            instance.isRender = false;
        }
        instance.parentVNode = parentVNode;
        instance.vNode = nextVNode;
        instance.isSVG = isSVG;
        nextVNode.children = instance;
        nextVNode.parentVNode = parentVNode;
        newDom = instance.update(lastVNode, nextVNode);
        nextVNode.dom = newDom;
        
        // for intact.js, the dom will not be removed and
        // the component will not be destoryed, so the ref
        // function need be called in update method.
        const lastRef = lastVNode.ref;
        const nextRef = nextVNode.ref;
        if (lastRef !== nextRef) {
            if (!isNullOrUndefined(lastRef)) {
                lastRef(null);
            }
            if (!isNullOrUndefined(nextRef)) {
                nextRef(instance);
            }
        }
    }

    // perhaps the dom has be replaced
    if (dom !== newDom && dom.parentNode &&
        // when dom has be replaced, its parentNode maybe be fragment in IE8
        dom.parentNode.nodeName !== '#document-fragment'
    ) {
        replaceChild(parentDom, lastVNode, nextVNode);
    }
}

function patchComponentInstance(lastVNode, nextVNode, parentDom, mountedQueue, parentVNode, isSVG) {
    const lastInstance = lastVNode.children;
    const nextInstance = nextVNode.children;
    const dom = lastVNode.dom;

    let newDom;

    if (lastInstance !== nextInstance) {
        // removeComponentClassOrInstance(lastVNode, null, nextVNode);
        newDom = createComponentClassOrInstance(nextVNode, parentDom, mountedQueue, lastVNode, false, parentVNode, isSVG);
    } else {
        lastInstance.mountedQueue = mountedQueue;
        if (lastInstance.mounted) {
            lastInstance.isRender = false;
        }
        lastInstance.vNode = nextVNode;
        lastInstance.parentVNode = parentVNode;
        nextVNode.parentVNode = parentVNode;
        newDom = lastInstance.update(lastVNode, nextVNode);
        nextVNode.dom = newDom;

        const ref = nextVNode.ref;
        if (typeof ref === 'function') {
            ref(instance);
        }
    }

    if (dom !== newDom && dom.parentNode && 
        // when dom has be replaced, its parentNode maybe be fragment in IE8
        dom.parentNode.nodeName !== '#document-fragment'
    ) {
        replaceChild(parentDom, lastVNode, nextVNode);
    }
}

// function patchComponentFunction(lastVNode, nextVNode, parentDom, mountedQueue) {
    // const lastTag = lastVNode.tag;
    // const nextTag = nextVNode.tag;

    // if (lastVNode.key !== nextVNode.key) {
        // removeElements(lastVNode.children, parentDom);
        // createComponentFunction(nextVNode, parentDom, mountedQueue);
    // } else {
        // nextVNode.dom = lastVNode.dom;
        // createComponentFunctionVNode(nextVNode);
        // patchChildren(lastVNode.children, nextVNode.children, parentDom, mountedQueue);
    // }
// }

function patchChildren(lastChildren, nextChildren, parentDom, mountedQueue, parentVNode, isSVG) {
    if (isNullOrUndefined(lastChildren)) {
        if (!isNullOrUndefined(nextChildren)) {
            createElements(nextChildren, parentDom, mountedQueue, false, parentVNode, isSVG);
        }
    } else if (isNullOrUndefined(nextChildren)) {
        if (isStringOrNumber(lastChildren)) {
            setTextContent(parentDom, '');
        } else {
            removeElements(lastChildren, parentDom); 
        }
    } else if (isStringOrNumber(nextChildren)) {
        if (isStringOrNumber(lastChildren)) {
            setTextContent(parentDom, nextChildren);
        } else {
            removeElements(lastChildren, parentDom);
            setTextContent(parentDom, nextChildren);
        }
    } else if (isArray(lastChildren)) {
        if (isArray(nextChildren)) {
            patchChildrenByKey(lastChildren, nextChildren, parentDom, mountedQueue, parentVNode, isSVG);
        } else {
            removeElements(lastChildren, parentDom);
            createElement(nextChildren, parentDom, mountedQueue, false, parentVNode, isSVG);
        }
    } else if (isArray(nextChildren)) {
        if (isStringOrNumber(lastChildren)) {
            setTextContent(parentDom, '');
        } else {
            removeElement(lastChildren, parentDom);
        }
        createElements(nextChildren, parentDom, mountedQueue, false, parentVNode, isSVG);
    } else if (isStringOrNumber(lastChildren)) {
        setTextContent(parentDom, '');
        createElement(nextChildren, parentDom, mountedQueue, false, parentVNode, isSVG);
    } else {
        patchVNode(lastChildren, nextChildren, parentDom, mountedQueue, parentVNode, isSVG);
    }
}

function patchChildrenByKey(a, b, dom, mountedQueue, parentVNode, isSVG) {
    let aLength = a.length;
    let bLength = b.length;
    let aEnd = aLength - 1;
    let bEnd = bLength - 1;
    let aStart = 0;
    let bStart = 0;
    let i;
    let j;
    let aNode;
    let bNode;
    let nextNode;
    let nextPos;
    let node;
    let aStartNode = a[aStart];
    let bStartNode = b[bStart];
    let aEndNode = a[aEnd];
    let bEndNode = b[bEnd];

    outer: while (true) {
        while (aStartNode.key === bStartNode.key) {
            patchVNode(aStartNode, bStartNode, dom, mountedQueue, parentVNode, isSVG);
            ++aStart;
            ++bStart;
            if (aStart > aEnd || bStart > bEnd) {
                break outer;
            }
            aStartNode = a[aStart];
            bStartNode = b[bStart];
        }
        while (aEndNode.key === bEndNode.key) {
            patchVNode(aEndNode, bEndNode, dom, mountedQueue, parentVNode, isSVG);
            --aEnd;
            --bEnd;
            if (aEnd < aStart || bEnd < bStart) {
                break outer;
            }
            aEndNode = a[aEnd];
            bEndNode = b[bEnd];
        }

        if (aEndNode.key === bStartNode.key) {
            patchVNode(aEndNode, bStartNode, dom, mountedQueue, parentVNode, isSVG);
            dom.insertBefore(bStartNode.dom, aStartNode.dom);
            --aEnd;
            ++bStart;
            aEndNode = a[aEnd];
            bStartNode = b[bStart];
            continue;
        }

        if (aStartNode.key === bEndNode.key) {
            patchVNode(aStartNode, bEndNode, dom, mountedQueue, parentVNode, isSVG); 
            insertOrAppend(bEnd, bLength, bEndNode.dom, b, dom);
            ++aStart;
            --bEnd;
            aStartNode = a[aStart];
            bEndNode = b[bEnd];
            continue;
        }
        break;
    }

    if (aStart > aEnd) {
        while (bStart <= bEnd) {
            insertOrAppend(
                bEnd, bLength, 
                createElement(b[bStart], null, mountedQueue, false, parentVNode, isSVG),
                b, dom, true /* detectParent: for animate, if the parentNode exists, then do nothing*/
            );
            ++bStart;
        }
    } else if (bStart > bEnd) {
        while (aStart <= aEnd) {
            removeElement(a[aStart], dom);
            ++aStart;
        }
    } else {
        aLength = aEnd - aStart + 1;
        bLength = bEnd - bStart + 1;
        const sources = new Array(bLength);
        for (i = 0; i < bLength; i++) {
            sources[i] = -1;
        }
        let moved = false;
        let pos = 0;
        let patched = 0;

        if (bLength <= 4 || aLength * bLength <= 16) {
            for (i = aStart; i <= aEnd; i++) {
                aNode = a[i];
                if (patched < bLength) {
                    for (j = bStart; j <= bEnd; j++) {
                        bNode = b[j];
                        if (aNode.key === bNode.key) {
                            sources[j - bStart] = i;
                            if (pos > j) {
                                moved = true;
                            } else {
                                pos = j;
                            }
                            patchVNode(aNode, bNode, dom, mountedQueue, parentVNode, isSVG);
                            ++patched;
                            a[i] = null;
                            break;
                        }
                    }
                }
            }
        } else {
            var keyIndex = new SimpleMap();
            for (i = bStart; i <= bEnd; i++) {
                keyIndex.set(b[i].key, i);
            }
            for (i = aStart; i <= aEnd; i++) {
                aNode = a[i];
                if (patched < bLength) {
                    j = keyIndex.get(aNode.key);
                    if (j !== undefined) {
                        bNode = b[j];
                        sources[j - bStart] = i;
                        if (pos > j) {
                            moved = true;
                        } else {
                            pos = j;
                        }
                        patchVNode(aNode, bNode, dom, mountedQueue, parentVNode, isSVG);
                        ++patched;
                        a[i] = null;
                    }
                }
            }
        }
        if (aLength === a.length && patched === 0) {
            // removeAllChildren(dom, a);
            // children maybe have animation
            removeElements(a, dom);
            while (bStart < bLength) {
                createElement(b[bStart], dom, mountedQueue, false, parentVNode, isSVG);
                ++bStart;
            }
        } else {
            // some browsers, e.g. ie, must insert before remove for some element,
            // e.g. select/option, otherwise the selected property will be weird
            if (moved) {
                const seq = lisAlgorithm(sources);
                j = seq.length - 1;
                for (i = bLength - 1; i >= 0; i--) {
                    if (sources[i] === -1) {
                        pos = i + bStart;
                        insertOrAppend(
                            pos, b.length, 
                            createElement(b[pos], null, mountedQueue, false, parentVNode, isSVG), 
                            b, dom
                        );
                    } else {
                        if (j < 0 || i !== seq[j]) {
                            pos = i + bStart;
                            insertOrAppend(pos, b.length, b[pos].dom, b, dom);
                        } else {
                            --j;
                        }
                    }
                }
            } else if (patched !== bLength) {
                for (i = bLength - 1; i >= 0; i--) {
                    if (sources[i] === -1) {
                        pos = i + bStart;
                        insertOrAppend(
                            pos, b.length,
                            createElement(b[pos], null, mountedQueue, false, parentVNode, isSVG),
                            b, dom, true
                        );
                    }
                }
            }
            i = aLength - patched;
            while (i > 0) {
                aNode = a[aStart++];
                if (aNode !== null) {
                    removeElement(aNode, dom);
                    --i;
                }
            }
        }
    }
}

function lisAlgorithm(arr) {
    let p = arr.slice(0);
    let result = [0];
    let i;
    let j;
    let u;
    let v;
    let c;
    let len = arr.length;
    for (i = 0; i < len; i++) {
        let arrI = arr[i];
        if (arrI === -1) {
            continue;
        }
        j = result[result.length - 1];
        if (arr[j] < arrI) {
            p[i] = j;
            result.push(i);
            continue;
        }
        u = 0;
        v = result.length - 1;
        while (u < v) {
            c = ((u + v) / 2) | 0;
            if (arr[result[c]] < arrI) {
                u = c + 1;
            }
            else {
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
    u = result.length;
    v = result[u - 1];
    while (u-- > 0) {
        result[u] = v;
        v = p[v];
    }
    return result;
}

function insertOrAppend(pos, length, newDom, nodes, dom, detectParent) {
    const nextPos = pos + 1;
    // if (detectParent && newDom.parentNode) {
        // return;
    // } else
    if (nextPos < length) {
        dom.insertBefore(newDom, nodes[nextPos].dom);
    } else {
        dom.appendChild(newDom);
    }
}

function replaceElement(lastVNode, nextVNode, parentDom, mountedQueue, parentVNode, isSVG) {
    removeElement(lastVNode, null, nextVNode);
    createElement(nextVNode, null, mountedQueue, false, parentVNode, isSVG);
    replaceChild(parentDom, lastVNode, nextVNode);
}

function patchText(lastVNode, nextVNode, parentDom) {
    const nextText = nextVNode.children;
    const dom = lastVNode.dom;
    nextVNode.dom = dom;
    if (lastVNode.children !== nextText) {
        dom.nodeValue = nextText;
    }
}

export function patchProps(lastVNode, nextVNode, isSVG, isRender) {
    const lastProps = lastVNode && lastVNode.props || EMPTY_OBJ;
    const nextProps = nextVNode.props;
    const dom = nextVNode.dom;
    let prop;

    const isInputOrTextArea = (nextVNode.type & (Types.InputElement | Types.TextareaElement)) > 0;
    if (nextProps !== EMPTY_OBJ) {
        const isFormElement = (nextVNode.type & Types.FormElement) > 0;
        for (prop in nextProps) {
            patchProp(prop, lastProps[prop], nextProps[prop], dom, isFormElement, isSVG, isInputOrTextArea);
        }
        if (isFormElement) {
            processForm(nextVNode, dom, nextProps, isRender);
        }
    }
    if (lastProps !== EMPTY_OBJ) {
        for (prop in lastProps) {
            if (
                !isSkipProp(prop) &&
                isNullOrUndefined(nextProps[prop]) &&
                !isNullOrUndefined(lastProps[prop])
            ) {
                removeProp(prop, lastProps[prop], dom, isInputOrTextArea);
            } 
        }
    }
}

export function patchProp(prop, lastValue, nextValue, dom, isFormElement, isSVG, isInputOrTextArea) {
    if (lastValue !== nextValue) {
        if (isSkipProp(prop) || isFormElement && prop === 'value') {
            return;
        } else if (booleanProps[prop]) {
            dom[prop] = !!nextValue;
        } else if (strictProps[prop]) {
            const value = isNullOrUndefined(nextValue) ? '' : nextValue;
            // IE8 the value of option is equal to its text as default
            // so set it forcely
            if (dom[prop] !== value || browser.isIE8) {
                dom[prop] = value;
            }
            // add a private property _value for selecting an non-string value 
            if (prop === 'value') {
                dom._value = value;
            }
        } else if (isNullOrUndefined(nextValue)) {
            removeProp(prop, lastValue, dom, isInputOrTextArea);
        } else if (isEventProp(prop)) {
            handleEvent(prop.substr(3), lastValue, nextValue, dom);
        } else if (isObject(nextValue)) {
            patchPropByObject(prop, lastValue, nextValue, dom, isInputOrTextArea);
        } else if (prop === 'innerHTML') {
            dom.innerHTML = nextValue;
        } else {
            if (isSVG && namespaces[prop]) {
                dom.setAttributeNS(namespaces[prop], prop, nextValue);
            } else {
                // https://github.com/Javey/Intact/issues/19
                // IE 10/11 set placeholder will trigger input event
                if (
                    isInputOrTextArea &&
                    browser.isIE && 
                    (browser.version === 10 || browser.version === 11) &&
                    prop === 'placeholder'
                ) {
                    ignoreInputEvent(dom);
                    if (nextValue !== '') {
                        addFocusEvent(dom);
                    } else {
                        removeFocusEvent(dom);
                    }
                }
                dom.setAttribute(prop, nextValue);
            }
        }
    }
}

function ignoreInputEvent(dom) {
    if (!dom.__ignoreInputEvent) {
        const cb = (e) => {
            e.stopImmediatePropagation();
            delete dom.__ignoreInputEvent;
            dom.removeEventListener('input', cb);
        };
        dom.addEventListener('input', cb);
        dom.__ignoreInputEvent = true;
    }
}

function addFocusEvent(dom) {
    if (!dom.__addFocusEvent) {
        let ignore = false;
        const inputCb = (e) => {
            if (ignore) e.stopImmediatePropagation();
            ignore = false;
        };
        const focusCb = () => {
            ignore = true;
            // if we call input.focus(), the input event will not
            // be called, so we reset it next tick
            setTimeout(() => {
                ignore = false;
            });
        };
        dom.addEventListener('input', inputCb);
        dom.addEventListener('focusin', focusCb);
        dom.addEventListener('focusout', focusCb);
        dom.__addFocusEvent = {
            focusCb, inputCb
        };
    }
}

function removeFocusEvent(dom) {
    const cbs = dom.__addFocusEvent;
    if (cbs) {
        dom.addEventListener('input', cbs.inputCb);
        dom.addEventListener('focusin', cbs.focusCb);
        dom.addEventListener('focusout', cbs.focusCb);
        delete dom.__addFocusEvent;
    }
}

function removeProp(prop, lastValue, dom, isInputOrTextArea) {
    if (!isNullOrUndefined(lastValue)) {
        switch (prop) {
            case 'value':
                dom.value = '';
                return;
            case 'style':
                dom.removeAttribute('style');
                return;
            case 'attributes':
                for (let key in lastValue) {
                    dom.removeAttribute(key);
                }
                return;
            case 'dataset':
                removeDataset(lastValue, dom);
                return; 
            case 'innerHTML':
                dom.innerHTML = '';
                return;
            default:
                break;
        }

        if (booleanProps[prop]) {
            dom[prop] = false;
        } else if (isEventProp(prop)) {
            handleEvent(prop.substr(3), lastValue, null, dom);
        } else if (isObject(lastValue)){
            const domProp = dom[prop];
            try {
                dom[prop] = undefined;
                delete dom[prop];
            } catch (e) {
                for (let key in lastValue) {
                    delete domProp[key];
                }
            }
        } else {
            if (
                isInputOrTextArea &&
                browser.isIE && 
                (browser.version === 10 || browser.version === 11) &&
                prop === 'placeholder'
            ) {
                removeFocusEvent(dom);
            }
            dom.removeAttribute(prop);
        }
    }
}

const removeDataset = browser.isIE || browser.isSafari ? 
    function(lastValue, dom) {
        for (let key in lastValue) {
            dom.removeAttribute(`data-${kebabCase(key)}`);
        }
    } :
    function(lastValue, dom) {
        const domProp = dom.dataset;
        for (let key in lastValue) {
            delete domProp[key];
        }
    };

function patchPropByObject(prop, lastValue, nextValue, dom, isInputOrTextArea) {
    if (lastValue && !isObject(lastValue) && !isNullOrUndefined(lastValue)) {
        removeProp(prop, lastValue, dom, isInputOrTextArea);
        lastValue = null;
    }
    switch (prop) {
        case 'attributes':
            return patchAttributes(lastValue, nextValue, dom);
        case 'style':
            return patchStyle(lastValue, nextValue, dom);
        case 'dataset':
            return patchDataset(prop, lastValue, nextValue, dom);
        default:
            return patchObject(prop, lastValue, nextValue, dom);
    }
}

const patchDataset = browser.isIE ? 
    function patchDataset(prop, lastValue, nextValue, dom) {
        let hasRemoved = {};
        let key;
        let value;

        for (key in nextValue) {
            const dataKey = `data-${kebabCase(key)}`;
            value = nextValue[key];
            if (isNullOrUndefined(value)) {
                dom.removeAttribute(dataKey); 
                hasRemoved[key] = true;
            } else {
                dom.setAttribute(dataKey, value);
            }
        } 

        if (!isNullOrUndefined(lastValue)) {
            for (key in lastValue) {
                if (isNullOrUndefined(nextValue[key]) && !hasRemoved[key]) {
                    dom.removeAttribute(`data-${kebabCase(key)}`);
                }
            }
        }
    } : patchObject;

const _cache = {};
const uppercasePattern = /[A-Z]/g;
export function kebabCase(word) {
    if (!_cache[word]) {
        _cache[word] = word.replace(uppercasePattern, (item) => {
            return `-${item.toLowerCase()}`;
        });
    }
    return _cache[word];
}

function patchObject(prop, lastValue, nextValue, dom) {
    let domProps = dom[prop];
    if (isNullOrUndefined(domProps)) {
        domProps = dom[prop] = {};
    }
    let key;
    let value;
    for (key in nextValue) {
        domProps[key] = nextValue[key];
    }
    if (!isNullOrUndefined(lastValue)) {
        for (key in lastValue) {
            if (isNullOrUndefined(nextValue[key])) {
                delete domProps[key];
            }
        }
    }
}

function patchAttributes(lastValue, nextValue, dom) {
    const hasRemoved = {};
    let key;
    let value;
    for (key in nextValue) {
        value = nextValue[key];
        if (isNullOrUndefined(value)) {
            dom.removeAttribute(key);
            hasRemoved[key] = true;
        } else {
            dom.setAttribute(key, value);
        }
    }
    if (!isNullOrUndefined(lastValue)) {
        for (key in lastValue) {
            if (isNullOrUndefined(nextValue[key]) && !hasRemoved[key]) {
                dom.removeAttribute(key);
            }
        }
    }
}

function patchStyle(lastValue, nextValue, dom) {
    const domStyle = dom.style;
    const hasRemoved = {};
    let key;
    let value;
    for (key in nextValue) {
        value = nextValue[key];
        if (isNullOrUndefined(value)) {
            domStyle[key] = '';
            hasRemoved[key] = true;
        } else {
            domStyle[key] = value;
        }
    }
    if (!isNullOrUndefined(lastValue)) {
        for (key in lastValue) {
            if (isNullOrUndefined(nextValue[key]) && !hasRemoved[key]) {
                domStyle[key] = '';
            }
        }
    }
}
