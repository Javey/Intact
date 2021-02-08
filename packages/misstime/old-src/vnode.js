import {
    isArray, isStringOrNumber, isNullOrUndefined,
    isComponentInstance, browser, isInvalid
} from './utils';

export const Types = {
    Text: 1,
    HtmlElement: 1 << 1,

    ComponentClass: 1 << 2,
    ComponentFunction: 1 << 3,
    ComponentInstance: 1 << 4,

    HtmlComment: 1 << 5,

    InputElement: 1 << 6,
    SelectElement: 1 << 7,
    TextareaElement: 1 << 8,
    SvgElement: 1 << 9,

    UnescapeText: 1 << 10 // for server side render unescape text
};
Types.FormElement = Types.InputElement | Types.SelectElement | Types.TextareaElement;
Types.Element = Types.HtmlElement | Types.FormElement | Types.SvgElement;
Types.ComponentClassOrInstance = Types.ComponentClass | Types.ComponentInstance;
Types.TextElement = Types.Text | Types.HtmlComment;

export const EMPTY_OBJ = {};
if (process.env.NODE_ENV !== 'production' && !browser.isIE) {
    Object.freeze(EMPTY_OBJ);
}

export function VNode(type, tag, props, children, className, key, ref) {
    this.type = type;
    this.tag = tag;
    this.props = props;
    this.children = children;
    this.key = key;
    this.ref = ref;
    this.className = className;
}

export function createVNode(tag, props, children, className, key, ref) {
    let type;
    props || (props = EMPTY_OBJ);
    switch (typeof tag) {
        case 'string':
            if (tag === 'input') {
                type = Types.InputElement;
            } else if(tag === 'select') {
                type = Types.SelectElement;
            } else if (tag === 'textarea') {
                type = Types.TextareaElement;
            } else if (tag === 'svg') {
                type = Types.SvgElement;
            } else {
                type = Types.HtmlElement;
            }
            break;
        case 'function':
            // arrow function has not prototype
            if (tag.prototype && tag.prototype.init) {
                type = Types.ComponentClass;
            } else {
                // return tag(props);
                type = Types.ComponentFunction;
            }
            break;
        case 'object':
            if (tag.init) {
                return createComponentInstanceVNode(tag);
            }
        default:
            throw new Error(`unknown vNode type: ${tag}`);
    }

    if (type & (Types.ComponentClass | Types.ComponentFunction)) {
        if (!isNullOrUndefined(children)) {
            if (props === EMPTY_OBJ) props = {};
            props.children = normalizeChildren(children, false);
        } else if (!isNullOrUndefined(props.children)) {
            props.children = normalizeChildren(props.children, false);
        }
        if (type & Types.ComponentFunction) {
            if (key || ref) {
                if (props === EMPTY_OBJ) props = {};
                if (key) props.key = key;
                if (ref) props.ref = ref;
            }
            return tag(props);
        }
    } else if (!isNullOrUndefined(children)) {
        children = normalizeChildren(children, true);
    }

    return new VNode(type, tag, props, children,
        className || props.className,
        key || props.key,
        ref || props.ref
    );
}

export function createCommentVNode(children, key) {
    return new VNode(Types.HtmlComment, null, EMPTY_OBJ, children, null, key);
}

export function createUnescapeTextVNode(children) {
    return new VNode(Types.UnescapeText, null, EMPTY_OBJ, children);
}

export function createTextVNode(text, key) {
    return new VNode(Types.Text, null, EMPTY_OBJ, text, null, key);
}

export function createVoidVNode() {
    return new VNode(Types.VoidElement, null, EMPTY_OBJ);
}

export function createComponentInstanceVNode(instance) {
    const props = instance.props || EMPTY_OBJ;
    return new VNode(Types.ComponentInstance, instance.constructor,
        props, instance, null, props.key, props.ref
    );
}

function normalizeChildren(vNodes, isAddKey) {
    if (isArray(vNodes)) {
        const childNodes = addChild(vNodes, {index: 0}, isAddKey);
        return childNodes.length ? childNodes : null;
    } else if (isComponentInstance(vNodes)) {
        return createComponentInstanceVNode(vNodes);
    } else if (vNodes.type && isAddKey) {
        if (!isNullOrUndefined(vNodes.dom) || vNodes.$) {
            return directClone(vNodes);
        }

        // add a flag to indicate that we have handle the vNode
        // when it came back we should clone it
        vNodes.$ = true;
    }
    return vNodes;
}

function applyKey(vNode, reference, isAddKey) {
    if (!isAddKey) return vNode;
    // start with '.' means the vNode has been set key by index
    // we will reset the key when it comes back again
    if (isNullOrUndefined(vNode.key) || vNode.key[0] === '.') {
        vNode.key = `.$${reference.index++}`;
    }
    // add a flag to indicate that we have handle the vNode
    // when it came back we should clone it
    vNode.$ = true;
    return vNode;
}

function addChild(vNodes, reference, isAddKey) {
    let newVNodes;
    for (let i = 0; i < vNodes.length; i++) {
        const n = vNodes[i];
        if (isNullOrUndefined(n)) {
            if (!newVNodes) {
                newVNodes = vNodes.slice(0, i);
            }
        } else if (isArray(n)) {
            if (!newVNodes) {
                newVNodes = vNodes.slice(0, i);
            }
            newVNodes = newVNodes.concat(addChild(n, reference, isAddKey));
        } else if (isStringOrNumber(n)) {
            if (!newVNodes) {
                newVNodes = vNodes.slice(0, i);
            }
            newVNodes.push(applyKey(createTextVNode(n), reference, isAddKey));
        } else if (isComponentInstance(n)) {
            if (!newVNodes) {
                newVNodes = vNodes.slice(0, i);
            }
            newVNodes.push(applyKey(createComponentInstanceVNode(n), reference, isAddKey));
        } else if (n.type) {
            if (!newVNodes) {
                newVNodes = vNodes.slice(0, i);
            }
            if (isAddKey && (n.dom || n.$)) {
                newVNodes.push(applyKey(directClone(n), reference, isAddKey));
            } else {
                newVNodes.push(applyKey(n, reference, isAddKey));
            }
        }
    }
    return newVNodes || vNodes;
}

export function directClone(vNode, extraProps, changeType) {
    let newVNode;
    const type = vNode.type;

    if (type & (Types.ComponentClassOrInstance | Types.Element)) {
        // maybe we does not shadow copy props
        let props = vNode.props || EMPTY_OBJ;
        /**
         * if this is a instance vNode, then we must change its type to new instance again
         *
         * but if we change the type, it will lead to replace element because of different type.
         * only change the type, when we really clone it
         */
        let _type = (type & Types.ComponentInstance) && changeType ? Types.ComponentClass : type;
        if (extraProps) {
            // if exist extraProps, shadow copy
            let _props = {};
            for (let key in props) {
                _props[key] = props[key];
            }
            for (let key in extraProps) {
                _props[key] = extraProps[key];
            }
            const children = extraProps.children;
            if (children) {
                _props.children = normalizeChildren(children, false);
            }

            newVNode = new VNode(
                _type, vNode.tag, _props,
                vNode.children,
                _props.className || vNode.className,
                _props.key || vNode.key,
                _props.ref || vNode.ref
            );
        } else {
            newVNode = new VNode(
                _type, vNode.tag, props,
                vNode.children,
                vNode.className,
                vNode.key,
                vNode.ref
            );
        }
    } else if (type & Types.Text) {
        newVNode = createTextVNode(vNode.children, vNode.key);
    } else if (type & Types.HtmlComment) {
        newVNode = createCommentVNode(vNode.children, vNode.key);
    }

    return newVNode;
}

function directCloneChildren(children) {
    if (children) {
        if (isArray(children)) {
            const len = children.length;
            if (len > 0) {
                const tmpArray = [];

                for (let i = 0; i < len; i++) {
                    const child = children[i];
                    if (isStringOrNumber(child)) {
                        tmpArray.push(child);
                    } else if (!isInvalid(child) && child.type) {
                        tmpArray.push(directClone(child));
                    }
                }
                return tmpArray;
            }
        } else if (children.type) {
            return directClone(children);
        }
    }

    return children;
}
